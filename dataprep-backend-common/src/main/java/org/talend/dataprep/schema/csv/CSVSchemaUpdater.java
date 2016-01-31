package org.talend.dataprep.schema.csv;

import org.apache.commons.lang.StringUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;
import org.talend.dataprep.api.dataset.DataSetMetadata;
import org.talend.dataprep.schema.FormatGuess;
import org.talend.dataprep.schema.SchemaUpdater;

/**
 *
 */
@Component
public class CSVSchemaUpdater implements SchemaUpdater {

    /** CSV format utils. */
    @Autowired
    CSVFormatUtils formatUtils;

    /** the format guess. */
    @Autowired
    private CSVFormatGuess formatGuess;

    /**
     * @see SchemaUpdater#accept(DataSetMetadata)
     */
    @Override
    public boolean accept(DataSetMetadata metadata) {
        return StringUtils.equals(metadata.getContent().getFormatGuessId(), CSVFormatGuess.BEAN_ID);
    }

    /**
     * @see SchemaUpdater#updateSchema(DataSetMetadata, DataSetMetadata)
     */
    @Override
    public void updateSchema(DataSetMetadata original, DataSetMetadata updated) {
        formatUtils.useNewSeparator(original, updated);
    }

    /**
     * @return the format guess.
     */
    @Override
    public FormatGuess getFormatGuess() {
        return formatGuess;
    }

}
