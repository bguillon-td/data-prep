package org.talend.dataprep.api.service.command;

import java.io.IOException;
import java.io.InputStream;
import java.util.*;

import com.fasterxml.jackson.databind.ObjectReader;
import org.apache.http.client.HttpClient;
import org.apache.http.client.methods.HttpGet;
import org.apache.http.client.methods.HttpPost;
import org.apache.http.entity.InputStreamEntity;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Scope;
import org.springframework.http.converter.json.Jackson2ObjectMapperBuilder;
import org.springframework.stereotype.Component;
import org.springframework.web.context.WebApplicationContext;
import org.talend.dataprep.api.preparation.Action;
import org.talend.dataprep.api.service.APIService;
import org.talend.dataprep.api.service.api.PreviewDiffInput;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.ObjectWriter;
import com.netflix.hystrix.HystrixCommand;

import static java.util.Collections.EMPTY_LIST;

@Component
@Scope("request")
public class PreviewDiff extends HystrixCommand<InputStream> {

    private final HttpClient client;

    private final String contentServiceUrl;
    private final String transformationServiceUrl;
    private final String preparationServiceUrl;

    private final PreviewDiffInput input;
    
    private ObjectMapper objectMapper;
    private ObjectReader jsonReader;
    private ObjectWriter jsonWriter;

    @Autowired
    private WebApplicationContext context;

    @Autowired(required = true)
    private Jackson2ObjectMapperBuilder builder;

    private PreviewDiff(final HttpClient client, final String contentServiceUrl, final String transformationServiceUrl, final String preparationServiceUrl, final PreviewDiffInput input) {
        super(APIService.PREPARATION_GROUP);
        this.client = client;
        this.contentServiceUrl = contentServiceUrl;
        this.transformationServiceUrl = transformationServiceUrl;
        this.preparationServiceUrl = preparationServiceUrl;
        this.input = input;
    }

    @Override
    protected InputStream run() throws Exception {

        //get preparation details
        final JsonNode preparationDetails = getPreparationDetails(input.getPreparationId());
        final JsonNode stepsNode = preparationDetails.get("steps");
        final JsonNode actionsNode = preparationDetails.get("actions");
        final String dataSetId = preparationDetails.get("dataSetId").textValue();

        //extract actions by steps in chronological order, until input defined last active step
        final List<String> currentStepsIds = getActionsStepIds(stepsNode, input.getCurrentStepId());
        final Map<String, Action> currentActions = getActions(actionsNode, currentStepsIds);

        //extract actions without disabled steps
        final List<String> previewStepsIds = getActionsStepIds(stepsNode, input.getPreviewStepId());
        final Map<String, Action> previewActions = getActions(actionsNode, previewStepsIds);

        //serialize and base 64 encode the 2 actions list
        final String currentEncodedActions = serializeAndEncode(currentActions);
        final String previewEncodedActions = serializeAndEncode(previewActions);

        //get dataset content
        final InputStream content = getDatasetContent(dataSetId);

        //get usable tdpIds
        final String encodedTdpIds = serializeAndEncode(input.getTdpIds());

        //call transformation preview with content and the 2 transformations
        return previewTransformation(content, currentEncodedActions, previewEncodedActions, encodedTdpIds);
    }

    /**
     * Call the transformation service to compute preview between old and new transformation
     * @param content - the dataset content
     * @param oldEncodedActions - the old actions
     * @param newEncodedActions - the preview actions
     * @param encodedTdpIds - the TDP ids
     * @throws java.io.IOException
     */
    private InputStream previewTransformation(final InputStream content, final String oldEncodedActions, final String newEncodedActions,final String encodedTdpIds) throws IOException {
        final String uri = this.transformationServiceUrl + "/transform/preview?oldActions=" + oldEncodedActions + "&newActions=" + newEncodedActions + "&indexes=" + encodedTdpIds;
        HttpPost transformationCall = new HttpPost(uri);

        transformationCall.setEntity(new InputStreamEntity(content));
        return new ReleasableInputStream(client.execute(transformationCall).getEntity().getContent(),
                transformationCall::releaseConnection);
    }

    /**
     * Get dataset records
     * @param dataSetId - the dataset id
     * @return the resulting input stream records
     */
    private InputStream getDatasetContent(final String dataSetId) {
        final DataSetGet retrieveDataSet = context.getBean(DataSetGet.class, client, contentServiceUrl, dataSetId, false, true);
        return retrieveDataSet.execute();
    }

    /**
     * Serialize the actions to string and encode it to base 64
     * @param stepActions - map of couple (stepId, action)
     * @return the serialized and encoded actions
     */
    private String serializeAndEncode(final Map<String, Action> stepActions) throws JsonProcessingException {
        final String serialized = "{\"actions\": " + getJsonWriter().writeValueAsString(stepActions.values()) + "}";

        return Base64.getEncoder().encodeToString(serialized.getBytes());
    }

    /**
     * Serialize the list of integer to string and encode it to base 64
     * @param listToEncode - list of integer to encode
     * @return the serialized and encoded list
     */
    private String serializeAndEncode(final List<Integer> listToEncode) throws JsonProcessingException {
        final String serialized = getJsonWriter().writeValueAsString(listToEncode);

        return Base64.getEncoder().encodeToString(serialized.getBytes());
    }

    /**
     * Get a map of couples (step id, action)
     * @param actionsNode - the Json node actions list
     * @param stepsIds - the step ids in the chronological order
     * @return The map of couples in the StepsIds order
     * @throws java.io.IOException
     */
    private Map<String, Action> getActions(final JsonNode actionsNode, final List<String> stepsIds) throws IOException {
        final Map<String, Action> result = new LinkedHashMap<>(stepsIds.size());

        for(int i = 0; i < stepsIds.size(); ++i) {
            result.put(stepsIds.get(i), getObjectMapper().readValue(actionsNode.get(i).toString(), Action.class));
        }

        return result;
    }

    /**
     * Get the list of steps ids, corresponding to actions, in the chronological order.
     * If the last active step is provided, the method will only get the steps id from first to the last active step (included).
     * @param stepsNode - the Json node steps list
     * @param lastStep - the last active step id
     * @return the list of steps ids
     */
    private List<String> getActionsStepIds(final JsonNode stepsNode, final String lastStep) throws JsonProcessingException {
        //original step : no action
        if(lastStep != null && lastStep.equals(stepsNode.get(stepsNode.size() - 1).textValue())) {
            return EMPTY_LIST;
        }

        final List<String> result = new ArrayList<>(stepsNode.size() - 1);

        //steps are in reverse order and the last is the initial step (no actions). So we skip the last and we get them in reverse order
        for(int i = stepsNode.size() - 2; i >= 0; --i) {
            final String stepId = stepsNode.get(i).textValue();
            result.add(stepId);

            if(lastStep != null && stepId.equals(lastStep)) {
                break;
            }
        }

        return result;
    }

    /**
     * Call Preparation Service to get preparation details
     * @param preparationId - the preparation id
     * @return the resulting Json node object
     * @throws java.io.IOException
     */
    private JsonNode getPreparationDetails(final String preparationId) throws IOException {
        final HttpGet preparationRetrieval = new HttpGet(preparationServiceUrl + "/preparations/" + preparationId); 
        try {
            InputStream content = client.execute(preparationRetrieval).getEntity().getContent();
            return getJsonReader().readTree(content);
        } finally {
            preparationRetrieval.releaseConnection();
        }
    }
    
    public ObjectMapper getObjectMapper() {
        if(objectMapper == null) {
            objectMapper = builder.build();
        }
        return objectMapper;
    }

    public ObjectReader getJsonReader() {
        if(jsonReader == null) {
            jsonReader = getObjectMapper().reader();
        }
        return jsonReader;
    }

    public ObjectWriter getJsonWriter() {
        if(jsonWriter == null) {
            jsonWriter = getObjectMapper().writer();
        }
        return jsonWriter;
    }
}