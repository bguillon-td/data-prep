package org.talend.dataprep.schema.csv;

import static org.junit.Assert.assertEquals;
import static org.talend.dataprep.schema.csv.CSVFormatGuess.*;

import org.junit.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.talend.dataprep.api.dataset.DataSetMetadata;
import org.talend.dataprep.schema.AbstractSchemaTestUtils;

/**
 * Unit test for CSVFormatUtils.
 * 
 * @see CSVFormatUtils
 */

public class CSVFormatUtilsTest extends AbstractSchemaTestUtils {

    /** The component to test. */
    @Autowired
    private CSVFormatUtils csvFormatUtils;

    @Test
    public void shouldUseNewSeparator() {
        // given
        final DataSetMetadata original = metadataBuilder.metadata() //
                .id("original") //
                .parameter(HEADER_COLUMNS_PARAMETER,
                        "[\"nickname|secret\",\"firstname|secret\",\"lastname|date\",\"of\",\"birth|city\"]")
                .parameter(SEPARATOR_PARAMETER, " ").parameter(HEADER_NB_LINES_PARAMETER, "12").build();

        final DataSetMetadata updated = metadataBuilder.metadata() //
                .id("original") //
                .parameter(HEADER_COLUMNS_PARAMETER,
                        "[\"nickname|secret\",\"firstname|secret\",\"lastname|date\",\"of\",\"birth|city\"]")
                .parameter(SEPARATOR_PARAMETER, "|") // new separator
                .parameter(HEADER_NB_LINES_PARAMETER, "12").build();

        // when
        csvFormatUtils.useNewSeparator(original, updated);

        // then
        final String updatedHeaderLine = updated.getContent().getParameters().get(HEADER_COLUMNS_PARAMETER);
        assertEquals(updatedHeaderLine, "[\"nickname\",\"secret firstname\",\"secret lastname\",\"date of birth\",\"city\"]");
    }
}