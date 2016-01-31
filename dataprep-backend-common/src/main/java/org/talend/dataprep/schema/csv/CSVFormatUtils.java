package org.talend.dataprep.schema.csv;

import static org.talend.dataprep.exception.error.CommonErrorCodes.UNABLE_TO_SERIALIZE_TO_JSON;
import static org.talend.dataprep.schema.csv.CSVFormatGuess.*;

import java.util.Arrays;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

import org.apache.commons.lang.StringUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.converter.json.Jackson2ObjectMapperBuilder;
import org.springframework.stereotype.Component;
import org.talend.dataprep.api.dataset.DataSetMetadata;
import org.talend.dataprep.exception.TDPException;
import org.talend.dataprep.exception.error.CommonErrorCodes;

import com.fasterxml.jackson.core.type.TypeReference;

/**
 * Utility class for CSV format handling.
 */
@Component
public class CSVFormatUtils {

    /**
     * Dataprep ready jackson builder.
     */
    @Autowired
    private Jackson2ObjectMapperBuilder builder;

    /**
     * Retrieve properties (separator, header and the headerNbLines) associated with a dataset content and put them in a
     * map with their corresponding key.
     *
     * @param separator the separator object detected by the CSVFormatGuesser
     * @return a map associating to header and separator parameters their corresponding value
     */
    public Map<String, String> compileSeparatorProperties(Separator separator) {
        return compileSeparatorProperties(
                String.valueOf(separator.getSeparator()),
                separator.getHeaders().keySet().stream().collect(Collectors.toList()),
                separator.isFirstLineAHeader() ? 1 : 0
        );
    }

    /**
     * @param parameters the dataset format parameters.
     * @return the list of the dataset header.
     */
    public List<String> retrieveHeader(Map<String, String> parameters) {
        List<String> header;
        try {
            String jsonMap = parameters.get(HEADER_COLUMNS_PARAMETER);
            header = builder.build().readValue(jsonMap, new TypeReference<List<String>>() {
            });
        } catch (Exception e) {
            throw new TDPException(CommonErrorCodes.UNABLE_TO_PARSE_JSON, e);
        }
        return header;
    }

    /**
     * Uses the <tt>separator</tt>, <tt>header</tt>, and <tt>headerNbLines</tt> to reset the parameters of a given
     * metadata.
     * 
     * @param dataSetMetadata the specified dataset metadata
     * @param separator the specified separator
     * @param header the specified header
     * @param headerNbLines the specified number of lines spanned by the header
     */
    public void resetParameters(DataSetMetadata dataSetMetadata, String separator, List<String> header, int headerNbLines) {
        dataSetMetadata.getContent().setNbLinesInHeader(headerNbLines);
        dataSetMetadata.getContent().setParameters(compileSeparatorProperties(separator, header, headerNbLines));
    }

    /**
     * Retrieve properties (separator, header and the headerNbLines) associated with a dataset content and put them in a
     * map with their corresponding key.
     *
     * @param separator     the specified separator
     * @param header        the specified header
     * @param headerNbLines the specified number of lines spanned by the header
     */
    private Map<String, String> compileSeparatorProperties(String separator, List<String> header, int headerNbLines) {
        Map<String, String> parameters = new HashMap<>();
        // separator
        parameters.put(SEPARATOR_PARAMETER, separator);
        String jsonHeader;
        try {
            jsonHeader = builder.build().writeValueAsString(header);
        } catch (Exception e) {
            throw new TDPException(UNABLE_TO_SERIALIZE_TO_JSON, e);
        }
        parameters.put(HEADER_COLUMNS_PARAMETER, jsonHeader);
        // nb lines of header
        parameters.put(HEADER_NB_LINES_PARAMETER, headerNbLines + "");
        return parameters;
    }

    /**
     * Use the separator from the metadata
     *
     * @param original the original dataset metadata.
     * @param updated  the dataset metadata to use.
     */
    public void useNewSeparator(DataSetMetadata original, DataSetMetadata updated) {

        // build the original line
        final Map<String, String> originalParameters = original.getContent().getParameters();
        final List<String> headers = retrieveHeader(originalParameters);
        final String originalSeparator = originalParameters.get(SEPARATOR_PARAMETER);
        String originalLine = "";
        for (int i = 0; i < headers.size(); i++) {
            originalLine += headers.get(i);
            if (i < headers.size() - 1) {
                originalLine += originalSeparator;
            }
        }

        // to split it according to the new separator
        final Map<String, String> newParameters = updated.getContent().getParameters();
        final String newSeparator = newParameters.get(SEPARATOR_PARAMETER);
        final String newHeaderLines = newParameters.get(HEADER_NB_LINES_PARAMETER);
        final List<String> newHeaders = Arrays.asList(StringUtils.split(originalLine, newSeparator));

        // update the metadata with the new parameters
        updated.getContent().setParameters(compileSeparatorProperties(newSeparator, newHeaders, Integer.valueOf(newHeaderLines)));

    }
}
