package org.talend.dataprep.transformation.format;

import java.io.OutputStream;
import java.util.Map;

import org.springframework.beans.BeansException;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.ApplicationContext;
import org.springframework.stereotype.Service;
import org.talend.dataprep.exception.TDPException;
import org.talend.dataprep.exception.error.TransformationErrorCodes;
import org.talend.dataprep.transformation.api.transformer.TransformerWriter;

/**
 * Service in charge of writers.
 */
@Service
public class WriterRegistrationService {

    /** Spring application context needed to get writer instance. */
    @Autowired
    private ApplicationContext context;

    /**
     * Return a TransformWriter that match the given format.
     *
     * @param format the wanted format id.
     * @param output Where the writer should write.
     * @param parameters Optional writer parameters. @return the TransformWriter that match the given format.
     */
    public TransformerWriter getWriter(String format, OutputStream output, Map<String, String> parameters) {
        try {
            if (parameters.isEmpty()) {
                return (TransformerWriter) context.getBean("writer#" + format, output);
            } else {
                return (TransformerWriter) context.getBean("writer#" + format, output, parameters);
            }
        } catch (BeansException be) {
            throw new TDPException(TransformationErrorCodes.OUTPUT_TYPE_NOT_SUPPORTED, be);
        }
    }

}
