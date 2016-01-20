package org.talend.dataprep.api.service.command.dataset;

import static org.talend.dataprep.api.service.command.common.Defaults.emptyStream;
import static org.talend.dataprep.api.service.command.common.Defaults.pipeStream;

import java.io.InputStream;
import java.net.URISyntaxException;

import org.apache.http.client.HttpClient;
import org.apache.http.client.methods.HttpGet;
import org.apache.http.client.methods.HttpRequestBase;
import org.apache.http.client.utils.URIBuilder;
import org.springframework.context.annotation.Scope;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Component;
import org.talend.dataprep.api.service.DataSetAPI;
import org.talend.dataprep.api.service.PreparationAPI;
import org.talend.dataprep.api.service.command.common.GenericCommand;
import org.talend.dataprep.exception.TDPException;
import org.talend.dataprep.exception.error.APIErrorCodes;
import org.talend.dataprep.exception.error.CommonErrorCodes;

@Component
@Scope("request")
public class CompatibleDataSetList extends GenericCommand<InputStream> {

    private CompatibleDataSetList(HttpClient client, String dataSetId, String sort, String order) {
        super(DataSetAPI.DATASET_GROUP, client);

        try {
            execute(() -> onExecute(dataSetId, sort, order));
            onError(e -> new TDPException(APIErrorCodes.UNABLE_TO_LIST_DATASETS, e));
            on(HttpStatus.NO_CONTENT, HttpStatus.ACCEPTED).then(emptyStream());
            on(HttpStatus.OK).then(pipeStream());

        } catch (Exception e) {
            throw new TDPException(CommonErrorCodes.UNEXPECTED_EXCEPTION, e);
        }
    }

    private HttpRequestBase onExecute(String dataSetId, String sort, String order) {
        try {

            URIBuilder uriBuilder = new URIBuilder(datasetServiceUrl + "/datasets/" + dataSetId + "/compatibledatasets");
            uriBuilder.addParameter("dataSetId", dataSetId);
            uriBuilder.addParameter("sort", sort);
            uriBuilder.addParameter("order", order);

            return new HttpGet(uriBuilder.build());
        } catch (URISyntaxException e) {
            throw new TDPException(CommonErrorCodes.UNEXPECTED_EXCEPTION, e);
        }
    }

}
