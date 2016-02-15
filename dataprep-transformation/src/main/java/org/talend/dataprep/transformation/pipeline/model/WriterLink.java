package org.talend.dataprep.transformation.pipeline.model;

import java.io.IOException;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.talend.dataprep.api.dataset.DataSetRow;
import org.talend.dataprep.api.dataset.RowMetadata;
import org.talend.dataprep.transformation.api.transformer.TransformerWriter;

public class WriterLink implements Link {

    private static final Logger LOGGER = LoggerFactory.getLogger(WriterLink.class);

    private final TransformerWriter writer;

    private RowMetadata rowMetadata;

    private boolean startRecords = false;

    public WriterLink(TransformerWriter writer) {
        this.writer = writer;

    }

    @Override
    public void emit(DataSetRow row) {
        try {
            if (!startRecords) {
                writer.startObject();
                writer.fieldName("records");
                writer.startArray();
                startRecords = true;
            }
            rowMetadata = row.getRowMetadata();
            writer.write(row);
        } catch (IOException e) {
            LOGGER.error("Unable to write record.", e);
        }
    }

    @Override
    public void accept(Visitor visitor) {
        visitor.visitWriterLink(this);
    }

    @Override
    public void signal(Signal signal) {
        if (signal == Signal.END_OF_STREAM) {
            try {
                writer.endArray(); // <- end records
                writer.fieldName("metadata"); // <- start metadata
                writer.startObject();
                {
                    writer.fieldName("columns");
                    writer.write(rowMetadata);
                }
                writer.endObject();
                writer.endObject(); // <- end data set
                writer.flush();
            } catch (IOException e) {
                LOGGER.error("Unable to end writer.", e);
            }
        } else {
            LOGGER.debug("Unhandled signal {}.", signal);
        }
    }

    public TransformerWriter getWriter() {
        return writer;
    }
}
