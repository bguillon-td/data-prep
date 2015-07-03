package org.talend.dataprep.api.service.command.preparation;

import java.io.IOException;
import java.io.InputStream;
import java.util.*;

import org.apache.http.client.HttpClient;
import org.apache.http.client.methods.HttpPost;
import org.apache.http.entity.InputStreamEntity;
import org.springframework.context.annotation.Scope;
import org.springframework.stereotype.Component;
import org.talend.dataprep.api.preparation.Action;
import org.talend.dataprep.api.preparation.Preparation;
import org.talend.dataprep.api.service.APIService;
import org.talend.dataprep.api.service.api.PreviewDiffInput;
import org.talend.dataprep.api.service.command.ReleasableInputStream;
import org.talend.dataprep.api.service.command.common.PreparationCommand;

@Component
@Scope("request")
public class PreviewDiff extends PreparationCommand<InputStream> {

    private final PreviewDiffInput input;

    public PreviewDiff(final HttpClient client, final PreviewDiffInput input) {
        super(APIService.PREPARATION_GROUP, client);
        this.input = input;
    }

    @Override
    protected InputStream run() throws Exception {
        // get preparation details
        final Preparation preparation = getPreparation(input.getPreparationId());
        final String dataSetId = preparation.getDataSetId();

        // get steps from first operation to head
        final List<String> steps = preparation.getSteps();
        steps.remove(0);

        // extract actions by steps in chronological order, until last active step (from input)
        Map<String, Action> originalActions = new LinkedHashMap<>();
        final Iterator<Action> actions = getPreparationActions(preparation, input.getCurrentStepId()).iterator();
        steps.stream().filter(step -> actions.hasNext()).forEach(step -> originalActions.put(step, actions.next()));

        // extract actions by steps in chronological order, until preview step (from input)
        Map<String, Action> previewActions = new LinkedHashMap<>();
        final List<String> previewSteps = preparation.getSteps();
        final Iterator<Action> previewActionsIterator = getPreparationActions(preparation, input.getPreviewStepId()).iterator();
        previewSteps.stream().filter(step -> previewActionsIterator.hasNext()).forEach(step -> previewActions.put(step, previewActionsIterator.next()));

        // serialize and base 64 encode the 2 actions list
        final String oldEncodedActions = serialize(new ArrayList<>(originalActions.values()));
        final String newEncodedActions = serialize(new ArrayList<>(previewActions.values()));

        final InputStream content = getDatasetContent(dataSetId);
        final String encodedTdpIds = serializeAndEncode(input.getTdpIds());

        // call transformation preview with content and the 2 transformations
        return previewTransformation(content, oldEncodedActions, newEncodedActions, encodedTdpIds);
    }

    /**
     * Call the transformation service to compute preview between old and new transformation
     * 
     * @param content - the dataset content
     * @param oldEncodedActions - the old actions
     * @param newEncodedActions - the preview actions
     * @param encodedTdpIds - the TDP ids
     * @throws java.io.IOException
     */
    private InputStream previewTransformation(final InputStream content, final String oldEncodedActions,
            final String newEncodedActions, final String encodedTdpIds) throws IOException {
        final String uri = this.transformationServiceUrl + "/transform/preview?oldActions=" + oldEncodedActions + "&newActions="
                + newEncodedActions + "&indexes=" + encodedTdpIds;
        HttpPost transformationCall = new HttpPost(uri);

        transformationCall.setEntity(new InputStreamEntity(content));
        return new ReleasableInputStream(client.execute(transformationCall).getEntity().getContent(),
                transformationCall::releaseConnection);
    }
}
