package org.talend.dataprep.api.service;

import static org.springframework.http.MediaType.APPLICATION_JSON_VALUE;
import static org.talend.dataprep.api.service.command.error.ErrorList.ServiceType.*;

import java.io.IOException;
import java.io.InputStream;
import java.io.OutputStream;
import java.util.Enumeration;
import java.util.HashMap;
import java.util.Iterator;
import java.util.Map;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import org.apache.http.client.HttpClient;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.converter.json.Jackson2ObjectMapperBuilder;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.ResponseBody;
import org.springframework.web.bind.annotation.RestController;
import org.talend.dataprep.api.APIErrorCodes;
import org.talend.dataprep.api.service.command.error.ErrorList;
import org.talend.dataprep.exception.CommonErrorCodes;
import org.talend.dataprep.exception.ErrorCode;
import org.talend.dataprep.exception.json.JsonErrorCodeDescription;
import org.talend.dataprep.metrics.Timed;

import com.fasterxml.jackson.core.JsonFactory;
import com.fasterxml.jackson.core.JsonGenerator;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.netflix.hystrix.HystrixCommand;
import com.wordnik.swagger.annotations.Api;
import com.wordnik.swagger.annotations.ApiOperation;

/**
 * Common API that does not stand in either DataSet, Preparation nor Transform.
 */
@RestController
@Api(value = "api", basePath = "/api", description = "Common data-prep API")
public class CommonAPI extends APIService {

    @Autowired
    private Jackson2ObjectMapperBuilder builder;

    /**
     * Describe the supported error codes.
     * 
     * @param response the http response.
     */
    @RequestMapping(value = "/api/errors", method = RequestMethod.GET, produces = APPLICATION_JSON_VALUE)
    @ApiOperation(value = "Get all supported errors.", notes = "Returns the list of all supported errors.")
    @Timed
    public void listErrors(HttpServletResponse response) throws IOException {

        LOG.debug("Listing supported error codes");

        OutputStream output = response.getOutputStream();
        JsonFactory factory = new JsonFactory();
        JsonGenerator generator = factory.createGenerator(output);
        generator.setCodec(builder.build());

        // start the errors array
        generator.writeStartArray();

        // write the direct known errors
        writeErrorsFromEnum(generator, CommonErrorCodes.values());
        writeErrorsFromEnum(generator, APIErrorCodes.values());

        // get dataset api errors
        HttpClient client = getClient();
        HystrixCommand<InputStream> datasetErrors = getCommand(ErrorList.class, client, PreparationAPI.DATASET_GROUP, DATASET);
        writeErrorsFromApi(generator, datasetErrors.execute());

        // get preparation api errors
        HystrixCommand<InputStream> preparationErrors = getCommand(ErrorList.class, client, PreparationAPI.PREPARATION_GROUP,
                PREPARATION);
        writeErrorsFromApi(generator, preparationErrors.execute());

        // get transformation api errors
        HystrixCommand<InputStream> transformationErrors = getCommand(ErrorList.class, client, PreparationAPI.TRANSFORM_GROUP,
                TRANSFORMATION);
        writeErrorsFromApi(generator, transformationErrors.execute());

        // close the errors array
        generator.writeEndArray();
        generator.flush();
    }

    @RequestMapping(value="/error", produces= APPLICATION_JSON_VALUE)
    @ResponseBody
    public Map<String, Object> handle(final HttpServletRequest request, final HttpServletResponse response) {
        final int status = Integer.parseInt(request.getAttribute("javax.servlet.error.status_code").toString());
        final Object message = request.getAttribute("javax.servlet.error.message");

        final Map<String, Object> body = new HashMap<>();
        body.put("status", status);
        body.put("reason", message);

        response.setStatus(status);

        return body;
    }

    /**
     * Write the given error codes to the generator.
     *
     * @param generator the json generator to use.
     * @param codes the error codes to write.
     * @throws IOException if an error occurs.
     */
    private void writeErrorsFromEnum(JsonGenerator generator, ErrorCode[] codes) throws IOException {
        for (ErrorCode code : codes) {
            // cast to JsonErrorCode needed to ease json handling
            JsonErrorCodeDescription description = new JsonErrorCodeDescription(code);
            generator.writeObject(description);
        }
    }

    /**
     * Write the given error codes to the generator.
     *
     * @param generator the json generator to use.
     * @param input the error codes to write to read from the input stream.
     * @throws IOException if an error occurs.
     */
    private void writeErrorsFromApi(JsonGenerator generator, InputStream input) throws IOException {
        final ObjectMapper objectMapper = builder.build();
        Iterator<JsonErrorCodeDescription> iterator = objectMapper.reader(JsonErrorCodeDescription.class).readValues(input);
        while (iterator.hasNext()) {
            final JsonErrorCodeDescription description = iterator.next();
            generator.writeObject(description);
        }
    }
}