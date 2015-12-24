package org.talend.dataprep.transformation.service;

import static java.util.stream.Collectors.toList;
import static org.springframework.http.MediaType.APPLICATION_JSON_VALUE;
import static org.springframework.web.bind.annotation.RequestMethod.POST;

import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.io.InputStream;
import java.io.OutputStream;
import java.util.Enumeration;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.StreamSupport;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import javax.servlet.http.Part;

import org.apache.commons.io.IOUtils;
import org.apache.commons.lang.StringUtils;
import org.apache.http.client.HttpClient;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.ApplicationContext;
import org.springframework.http.MediaType;
import org.springframework.http.converter.json.Jackson2ObjectMapperBuilder;
import org.springframework.web.bind.annotation.*;
import org.talend.daikon.exception.ExceptionContext;
import org.talend.dataprep.api.dataset.DataSet;
import org.talend.dataprep.api.preparation.StepDiff;
import org.talend.dataprep.exception.TDPException;
import org.talend.dataprep.exception.error.CommonErrorCodes;
import org.talend.dataprep.exception.error.TransformationErrorCodes;
import org.talend.dataprep.metrics.Timed;
import org.talend.dataprep.metrics.VolumeMetered;
import org.talend.dataprep.transformation.aggregation.AggregationService;
import org.talend.dataprep.transformation.aggregation.api.AggregationParameters;
import org.talend.dataprep.transformation.aggregation.api.AggregationResult;
import org.talend.dataprep.transformation.api.action.dynamic.DynamicType;
import org.talend.dataprep.transformation.api.action.dynamic.GenericParameter;
import org.talend.dataprep.transformation.api.action.metadata.common.ActionMetadata;
import org.talend.dataprep.transformation.api.transformer.TransformerFactory;
import org.talend.dataprep.transformation.api.transformer.configuration.Configuration;
import org.talend.dataprep.transformation.api.transformer.configuration.PreviewConfiguration;
import org.talend.dataprep.transformation.api.transformer.suggestion.SuggestionEngine;
import org.talend.dataprep.transformation.format.ExportFormat;
import org.talend.dataprep.transformation.format.FormatRegistrationService;
import org.talend.dataprep.transformation.format.JsonFormat;

import com.fasterxml.jackson.core.JsonParser;
import com.fasterxml.jackson.databind.JsonMappingException;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;

import io.swagger.annotations.Api;
import io.swagger.annotations.ApiOperation;
import io.swagger.annotations.ApiParam;

@Deprecated
@RestController
@Api(value = "transformations", basePath = "/transform", description = "Deprecated transformations on data")
public class DeprecatedTransformationService {

    /** This class' logger. */
    private static final Logger LOG = LoggerFactory.getLogger(DeprecatedTransformationService.class);

    /** The Spring application context. */
    @Autowired
    private ApplicationContext context;

    /** The dataprep ready to use jackson object builder. */
    @Autowired(required = true)
    private Jackson2ObjectMapperBuilder builder;

    /** All available transformation actions. */
    @Autowired
    private ActionMetadata[] allActions;

    /** The transformer factory. */
    @Autowired
    private TransformerFactory factory;

    /** he aggregation service. */
    @Autowired
    private AggregationService aggregationService;

    /** The format registration service. */
    @Autowired
    private FormatRegistrationService formatRegistrationService;

    /** The action suggestion engine. */
    @Autowired
    private SuggestionEngine suggestionEngine;

    /** DataSet service url. */
    @Value("${dataset.service.url}")
    private String datasetServiceUrl;

    /** Preparation service url. */
    @Value("${preparation.service.url}")
    protected String preparationServiceUrl;

    /** Http client used to retrieve datasets or preparations. */
    @Autowired
    private HttpClient httpClient;

    /**
     * Apply all <code>actions</code> to <code>content</code>. Actions is a Base64-encoded JSON list of
     * {@link ActionMetadata} with parameters.
     * <p>
     * To prevent the actions to exceed URL length limit, everything is shipped within via the multipart request body.
     * AggregationOperation allows client to customize the output format (see {@link ExportFormat available format
     * types} ).
     * <p>
     * To prevent the actions to exceed URL length limit, everything is shipped within via the multipart request body.
     *
     * @param formatName The output {@link ExportFormat format}. This format also set the MIME response type.
     * @param actions A Base64-encoded list of actions.
     * @param content A JSON input that complies with {@link DataSet} bean.
     * @param response The response used to send transformation result back to client.
     */
    @RequestMapping(value = "/transform/{format}", method = POST, consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @ApiOperation(value = "Export the preparation applying the transformation", notes = "This operation format the input data transformed using the supplied actions in the provided format.", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @VolumeMetered
    @Deprecated
    //@formatter:off
    public void transform(@ApiParam(value = "Output format.") @PathVariable("format") final String formatName, //
                          @ApiParam(value = "Actions to perform on content.") @RequestPart(value = "actions", required = false) final Part actions, //
                          @ApiParam(value = "Data set content as JSON.") @RequestPart(value = "content", required = false) final Part content, //
                          final HttpServletResponse response, final HttpServletRequest request) {
    //@formatter:on
        final ExportFormat format = formatRegistrationService.getByName(formatName);
        if (format == null) {
            LOG.error("Export format {} not supported", formatName);
            throw new TDPException(TransformationErrorCodes.OUTPUT_TYPE_NOT_SUPPORTED);
        }

        final ObjectMapper mapper = builder.build();
        try (JsonParser parser = mapper.getFactory().createParser(content.getInputStream())) {
            Map<String, Object> arguments = new HashMap<>();
            final Enumeration<String> names = request.getParameterNames();
            while (names.hasMoreElements()) {

                final String paramName = names.nextElement();

                // filter out the content and the actions
                if (StringUtils.equals("actions", paramName) || StringUtils.equals("content", paramName) || //
                        StringUtils.equals(ExportFormat.Parameter.FILENAME_PARAMETER, paramName)) {
                    continue;
                }

                final String paramValue = request.getParameter(paramName);
                arguments.put(paramName, paramValue);

            }
            String decodedActions = actions == null ? StringUtils.EMPTY : IOUtils.toString(actions.getInputStream());
            final DataSet dataSet = mapper.readerFor(DataSet.class).readValue(parser);

            // set headers
            String name = request.getParameter("exportParameters." + ExportFormat.Parameter.FILENAME_PARAMETER);
            if (StringUtils.isBlank(name)) {
                name = "untitled";
            }

            response.setContentType(format.getMimeType());
            response.setHeader("Content-Disposition", "attachment; filename=\"" + name + format.getExtension() + "\"");

            Configuration configuration = Configuration.builder() //
                    .format(format.getName()) //
                    .args(arguments) //
                    .output(response.getOutputStream()) //
                    .actions(decodedActions) //
                    .build();
            factory.get(configuration).transform(dataSet, configuration);
        } catch (JsonMappingException e) {
            // Ignore (end of input)
        } catch (IOException e) {
            throw new TDPException(CommonErrorCodes.UNABLE_TO_PARSE_JSON, e);
        }
    }

    /**
     * Execute the preview and write result in the provided output stream
     *
     * @param actions The actions to execute to diff with reference
     * @param referenceActions The reference actions
     * @param indexes The record indexes to diff. If null, it will process all records
     * @param dataSet The dataset (column metadata and records)
     * @param output The output stream where to write the result
     */
    private void executePreview(final String actions, final String referenceActions, final String indexes, final DataSet dataSet,
            final OutputStream output) {
        final PreviewConfiguration configuration = PreviewConfiguration.preview() //
                .withActions(actions) //
                .withIndexes(indexes) //
                .fromReference( //
                        Configuration.builder() //
                                .format(JsonFormat.JSON) //
                                .output(output) //
                                .actions(referenceActions) //
                                .build() //
        ) //
                .build();
        factory.get(configuration).transform(dataSet, configuration);
    }

    /**
     * This operation allow client to create a diff between 2 list of actions starting from the same data. For example,
     * sending:
     * <ul>
     * <li>{a1, a2} as old actions</li>
     * <li>{a1, a2, a3} as new actions</li>
     * </ul>
     * ... will highlight changes done by a3.
     * <p>
     * To prevent the actions to exceed URL length limit, everything is shipped within via the multipart request body.
     *
     * @param oldActions A list of actions.
     * @param newActions A list of actions.
     * @param indexes Allows client to indicates specific line numbers to focus on.
     * @param content A JSON input that complies with {@link DataSet} bean.
     * @param response The response used to send transformation result back to client.
     */
    @RequestMapping(value = "/transform/preview", method = POST, produces = APPLICATION_JSON_VALUE, consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @ApiOperation(value = "Preview the transformation on input data", notes = "This operation returns the input data diff between the old and the new transformation actions", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @VolumeMetered
    public void transformPreview(@ApiParam(value = "Old actions to perform on content.")
    @RequestPart(value = "oldActions", required = false)
    final Part oldActions, //
            @ApiParam(value = "New actions to perform on content.")
    @RequestPart(value = "newActions", required = false)
    final Part newActions, //
            @ApiParam(value = "The row indexes to return")
    @RequestPart(value = "indexes", required = false)
    final Part indexes, //
            @ApiParam(value = "Data set content as JSON")
    @RequestPart(value = "content", required = false)
    final Part content, //
            final HttpServletResponse response) {
        final ObjectMapper mapper = builder.build();
        try (JsonParser parser = mapper.getFactory().createParser(content.getInputStream())) {
            final String decodedIndexes = indexes == null ? null : IOUtils.toString(indexes.getInputStream());
            final String decodedOldActions = oldActions == null ? null : IOUtils.toString(oldActions.getInputStream());
            final String decodedNewActions = newActions == null ? null : IOUtils.toString(newActions.getInputStream());
            final DataSet dataSet = mapper.readerFor(DataSet.class).readValue(parser);

            executePreview(decodedNewActions, decodedOldActions, decodedIndexes, dataSet, response.getOutputStream());
        } catch (IOException e) {
            throw new TDPException(CommonErrorCodes.UNABLE_TO_PARSE_JSON, e);
        }
    }

    /**
     * Compare the results of 2 sets of actions, and return the diff metadata Ex : the created columns ids
     */
    @RequestMapping(value = "/transform/diff/metadata", method = POST, produces = APPLICATION_JSON_VALUE, consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @ApiOperation(value = "Apply a diff between 2 sets of actions and return the diff (containing created columns ids for example)", notes = "This operation returns the diff metadata", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @VolumeMetered
    public StepDiff getCreatedColumns(@ApiParam(value = "Actions that is considered as reference in the diff.")
    @RequestPart(value = "referenceActions", required = true)
    final Part referenceActions, //
            @ApiParam(value = "Actions which result will be compared to reference result.")
    @RequestPart(value = "diffActions", required = true)
    final Part diffActions, //
            @ApiParam(value = "Data set content as JSON. It should contains only 1 records, and the columns metadata")
    @RequestPart(value = "content", required = true)
    final Part content) {
        final ObjectMapper mapper = builder.build();
        final OutputStream output = new ByteArrayOutputStream();
        try (JsonParser parser = mapper.getFactory().createParser(content.getInputStream())) {
            // decode parts
            final String decodedReferenceActions = referenceActions == null ? null
                    : IOUtils.toString(referenceActions.getInputStream());
            final String decodedDiffActions = diffActions == null ? null : IOUtils.toString(diffActions.getInputStream());
            final DataSet dataSet = mapper.readerFor(DataSet.class).readValue(parser);

            // call diff
            executePreview(decodedDiffActions, decodedReferenceActions, null, dataSet, output);

            // extract created columns ids
            final JsonNode node = mapper.readTree(output.toString());
            final JsonNode columnsNode = node.findPath("columns");
            final List<String> createdColumns = StreamSupport.stream(columnsNode.spliterator(), false)
                    .filter(col -> "new".equals(col.path("__tdpColumnDiff").asText())).map(col -> col.path("id").asText())
                    .collect(toList());

            // create/return diff
            final StepDiff diff = new StepDiff();
            diff.setCreatedColumns(createdColumns);
            return diff;
        } catch (IOException e) {
            throw new TDPException(CommonErrorCodes.UNABLE_TO_PARSE_JSON, e);
        }
    }

    /**
     * Get the action dynamic params.
     */
    @RequestMapping(value = "/transform/suggest/{action}/params", method = POST)
    @ApiOperation(value = "Get the transformation dynamic parameters", notes = "Returns the transformation parameters.")
    @Timed
    public GenericParameter dynamicParams(@ApiParam(value = "Action name.")
    @PathVariable("action")
    final String action, //
            @ApiParam(value = "The column id.")
    @RequestParam(value = "columnId", required = true)
    final String columnId, //
            @ApiParam(value = "Data set content as JSON")
    final InputStream content) {
        final DynamicType actionType = DynamicType.fromAction(action);
        if (actionType == null) {
            final ExceptionContext exceptionContext = ExceptionContext.build().put("name", action);
            throw new TDPException(TransformationErrorCodes.UNKNOWN_DYNAMIC_ACTION, exceptionContext);
        }
        final ObjectMapper mapper = builder.build();
        try (JsonParser parser = mapper.getFactory().createParser(content)) {
            final DataSet dataSet = mapper.readerFor(DataSet.class).readValue(parser);
            return actionType.getGenerator(context).getParameters(columnId, dataSet);
        } catch (IOException e) {
            throw new TDPException(CommonErrorCodes.UNABLE_TO_PARSE_JSON, e);
        }
    }

    /**
     * Compute the given aggregation.
     *
     * @param parameters the aggregation parameters.
     * @param content the content to compute the aggregation on.
     * @param response the http response.
     */
    @RequestMapping(value = "/aggregate", method = POST, produces = APPLICATION_JSON_VALUE, consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @ApiOperation(value = "Compute the aggregation according to the request body parameters", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @VolumeMetered
    @Deprecated // should get the dataset on its own
    // @formatter:off
    public void aggregate(
            @ApiParam(value = "The aggregation parameters in json") @RequestPart(value = "parameters", required = true) final Part parameters,
            @ApiParam(value = "Content to apply the aggregation on") @RequestPart(value = "content", required = true) final Part content,
            final HttpServletResponse response) {
        // @formatter:on

        final ObjectMapper mapper = builder.build();

        // parse the parameters
        AggregationParameters params;
        try {
            params = mapper.readerFor(AggregationParameters.class).readValue(parameters.getInputStream());
            LOG.debug("Aggregation requested {}", params);
        } catch (IOException e) {
            throw new TDPException(CommonErrorCodes.BAD_AGGREGATION_PARAMETERS, e);
        }

        // apply the aggregation
        try (JsonParser parser = mapper.getFactory().createParser(content.getInputStream())) {
            final DataSet dataSet = mapper.readerFor(DataSet.class).readValue(parser);

            AggregationResult result = aggregationService.aggregate(params, dataSet);
            mapper.writer().writeValue(response.getWriter(), result);

        } catch (IOException e) {
            throw new TDPException(CommonErrorCodes.UNABLE_TO_PARSE_JSON, e);
        }

    }

}