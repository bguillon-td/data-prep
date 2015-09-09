package org.talend.dataprep.dataset.exception;

import java.io.InputStream;
import java.util.Arrays;
import java.util.Collection;
import java.util.Collections;
import java.util.List;

import javax.servlet.http.HttpServletResponse;

import org.talend.dataprep.api.dataset.DataSetLifecycle;
import org.talend.dataprep.api.dataset.DataSetMetadata;
import org.talend.dataprep.exception.error.ErrorCode;

/**
 * Dataset error codes.
 */
public enum DataSetErrorCodes implements ErrorCode {
    UNEXPECTED_IO_EXCEPTION(500),
    UNABLE_TO_READ_DATASET_CONTENT(500),
    UNABLE_TO_READ_REMOTE_DATASET_CONTENT(404),
    UNEXPECTED_JMS_EXCEPTION(500),
    UNABLE_TO_CLEAR_DATASETS(500),
    UNABLE_TO_DELETE_DATASET(400, "dataSetId"),
    UNABLE_TO_STORE_DATASET_CONTENT(500, "id"),
    UNABLE_TO_ANALYZE_COLUMN_TYPES(500),
    UNABLE_TO_ANALYZE_DATASET_QUALITY(500),
    /**
     * Error returned in case the data set is in "importing" state, meaning all mandatory analysis prevents service to
     * correctly serve data set's content.
     *
     * @see DataSetLifecycle#importing()
     */
    UNABLE_TO_SERVE_DATASET_CONTENT(400, "id"),

    /**
     * this one will happen when user do something on data whereas the data has been updated async in the backend and
     * this action is not possible anymore (i.e preview whereas this dataset do not need any preview)
     */
    REDIRECT_CONTENT(301),
    /**
     * Error returned in case user tries to access to a data set that does not exist (or no longer exists).
     * @see org.talend.dataprep.dataset.service.DataSetService#updateDataSet(String, DataSetMetadata)
     */
    DATASET_DOES_NOT_EXIST(400, "id"),
    /**
     * Error returned when the json that contains the dataset location cannot be parsed.
     *
     * @see org.talend.dataprep.dataset.service.DataSetService#create(String, String, InputStream, HttpServletResponse)
     */
    UNABLE_TO_READ_DATASET_LOCATION(400),

    /**
     * Error returned in case user tries to access to a column that does not exist (or no longer exists) for a data set .
     * @see org.talend.dataprep.dataset.service.DataSetService#updateDataSet(String, DataSetMetadata)
     */
    COLUMN_DOES_NOT_EXIST(400, "id"),
    /**
     * Error returned when the order is not supported.
     *
     * @see org.talend.dataprep.dataset.service.DataSetService#list(String, String)
     */
    ILLEGAL_ORDER_FOR_LIST(400, "order"),
    /**
     * Error returned when the sort is not supported.
     *
     * @see org.talend.dataprep.dataset.service.DataSetService#list(String, String)
     */
    ILLEGAL_SORT_FOR_LIST(400, "sort"),
    /**
     * Error returned when the dataset metadata could not be saved.
     */
    UNABLE_TO_STORE_DATASET_METADATA(500, "id"),
    /**
     * Error returned when the dataset metadata could not be read.
     */
    UNABLE_TO_READ_DATASET_METADATA(500, "id"),
    /**
     * Error return when the uploaded content is not supported by any {@link org.talend.dataprep.schema.FormatGuesser
     * guesser}.
     * @see org.talend.dataprep.schema.UnsupportedFormatGuess
     */
    UNSUPPORTED_CONTENT(400);

    /** The http status to use. */
    private int httpStatus;

    /** Expected entries to be in the context. */
    private List<String> expectedContextEntries;

    /**
     * default constructor.
     * 
     * @param httpStatus the http status to use.
     */
    DataSetErrorCodes(int httpStatus) {
        this.httpStatus = httpStatus;
        this.expectedContextEntries = Collections.emptyList();
    }

    /**
     * default constructor.
     *
     * @param httpStatus the http status to use.
     * @param contextEntries expected context entries.
     */
    DataSetErrorCodes(int httpStatus, String... contextEntries) {
        this.httpStatus = httpStatus;
        this.expectedContextEntries = Arrays.asList(contextEntries);
    }

    /**
     * @return the product.
     */
    @Override
    public String getProduct() {
        return "TDP"; //$NON-NLS-1$
    }

    /**
     * @return the group.
     */
    @Override
    public String getGroup() {
        return "DSS"; //$NON-NLS-1$
    }

    /**
     * @return the http status.
     */
    @Override
    public int getHttpStatus() {
        return httpStatus;
    }

    /**
     * @return the expected context entries.
     */
    @Override
    public Collection<String> getExpectedContextEntries() {
        return expectedContextEntries;
    }
}
