package org.talend.dataprep.api.service.command.preparation;

import static org.talend.dataprep.api.service.command.common.Defaults.emptyStream;
import static org.talend.dataprep.api.service.command.common.Defaults.pipeStream;

import java.io.InputStream;
import java.net.URISyntaxException;

import org.apache.commons.lang.StringUtils;
import org.apache.http.client.HttpClient;
import org.apache.http.client.methods.HttpGet;
import org.apache.http.client.methods.HttpRequestBase;
import org.apache.http.client.utils.URIBuilder;
import org.springframework.context.annotation.Scope;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Component;
import org.talend.dataprep.api.service.APIService;
import org.talend.dataprep.api.service.command.common.GenericCommand;
import org.talend.dataprep.exception.TDPException;
import org.talend.dataprep.exception.error.APIErrorCodes;
import org.talend.dataprep.exception.error.CommonErrorCodes;

@Component
@Scope("request")
public class PreparationList extends GenericCommand<InputStream> {

    private PreparationList(HttpClient client, Format format, String sort, String order) {
        super(APIService.PREPARATION_GROUP, client);
        execute(() -> onExecute(sort, order, format));
        onError(e -> new TDPException(APIErrorCodes.UNABLE_TO_RETRIEVE_PREPARATION_LIST, e));
        on(HttpStatus.NO_CONTENT, HttpStatus.ACCEPTED).then(emptyStream());
        on(HttpStatus.OK).then(pipeStream());
    }

    private PreparationList(HttpClient client, Format format) {
        this(client, format,"", "");
    }

    private HttpRequestBase onExecute(String sort, String order, Format format) {
        try {
            URIBuilder uriBuilder = null;
            if (Format.SHORT.equals(format)){
                uriBuilder = new URIBuilder(preparationServiceUrl + "/preparations"); //$NON-NLS-1$
            }else{
            uriBuilder = new URIBuilder(preparationServiceUrl + "/preparations/all"); //$NON-NLS-1$
            }

            if  ( StringUtils.isNotEmpty( sort )) {
                uriBuilder.addParameter("sort", sort);
            }
            if  ( StringUtils.isNotEmpty( order )) {
                uriBuilder.addParameter("order", order);
            }
            return new HttpGet( uriBuilder.build() );
        } catch (URISyntaxException e) {
            throw new TDPException(CommonErrorCodes.UNEXPECTED_EXCEPTION, e);
        }
    }

    public enum Format {
        SHORT,
        LONG
    }
}
