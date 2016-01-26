package org.talend.dataprep.exception.error;

import java.util.Arrays;
import java.util.Collection;
import java.util.List;

import org.talend.daikon.exception.error.ErrorCode;

/**
 * Preparation error codes.
 */
public enum PreparationErrorCodes implements ErrorCode {
                                                        PREPARATION_DOES_NOT_EXIST(404, "id"),
                                                        PREPARATION_STEP_DOES_NOT_EXIST(404, "id", "stepId"),
                                                        PREPARATION_STEP_CANNOT_BE_DELETED_IN_SINGLE_MODE(403, "id", "stepId"),
                                                        PREPARATION_ROOT_STEP_CANNOT_BE_DELETED(403, "id", "stepId"),
                                                        UNABLE_TO_SERVE_PREPARATION_CONTENT(400, "id", "version"),
                                                        UNABLE_TO_READ_PREPARATION(500, "id", "version");

    /** The http status to use. */
    private int httpStatus;

    /** Expected entries to be in the context. */
    private List<String> expectedContextEntries;

    /**
     * default constructor.
     *
     * @param httpStatus the http status to use.
     * @param contextEntries expected context entries.
     */
    PreparationErrorCodes(int httpStatus, String... contextEntries) {
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

    @Override
    public String getGroup() {
        return "PS"; //$NON-NLS-1$
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

    @Override
    public String getCode() {
        return this.toString();
    }
}
