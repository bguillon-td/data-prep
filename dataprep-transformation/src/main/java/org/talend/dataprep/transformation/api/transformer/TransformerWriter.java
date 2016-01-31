package org.talend.dataprep.transformation.api.transformer;

import java.io.IOException;

import org.talend.dataprep.api.dataset.DataSetRow;
import org.talend.dataprep.api.dataset.RowMetadata;

/**
 * Writer used to write transformed datasets. This interface provides an common abstraction of the output format (JSON,
 * CSV, Excel...).
 */
public interface TransformerWriter {

    /**
     * Write the given RowMetadata.
     *
     * @param columns the row metadata to write.
     * @throws IOException if an unexpected error occurs.
     */
    void write(RowMetadata columns) throws IOException;

    /**
     * Write the given row.
     *
     * @param row the row to write.
     * @throws IOException if an unexpected error occurs.
     */
    void write(DataSetRow row) throws IOException;

    /**
     * Start to write an array.
     *
     * @throws IOException if an unexpected error occurs.
     */
    default void startArray() throws IOException {
        // default implementation to ease implementations development
    }

    /**
     * End to write an array.
     *
     * @throws IOException if an unexpected error occurs.
     */
    default void endArray() throws IOException {
        // default implementation to ease implementations development
    }

    /**
     * Start to write an object.
     *
     * @throws IOException if an unexpected error occurs.
     */
    default void startObject() throws IOException {
        // default implementation to ease implementations development
    }

    /**
     * End to write an object.
     *
     * @throws IOException if an unexpected error occurs.
     */
    default void endObject() throws IOException {
        // default implementation to ease implementations development
    }

    /**
     * Write a field name.
     *
     * @throws IOException if an unexpected error occurs.
     */
    default void fieldName(String columns) throws IOException {
        // default implementation to ease implementations development
    }

    /**
     * Flush the current writing.
     *
     * @throws IOException if an unexpected error occurs.
     */
    default void flush() throws IOException {
        // default implementation to ease implementations development
    }

}
