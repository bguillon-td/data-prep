package org.talend.dataprep.schema.csv;

import static org.junit.Assert.assertFalse;
import static org.junit.Assert.assertTrue;
import static org.mockito.Mockito.times;
import static org.mockito.Mockito.verify;

import org.junit.Before;
import org.junit.Test;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.MockitoAnnotations;
import org.springframework.beans.factory.annotation.Autowired;
import org.talend.dataprep.api.dataset.DataSetMetadata;
import org.talend.dataprep.api.dataset.DataSetMetadataBuilder;
import org.talend.dataprep.schema.AbstractSchemaTestUtils;

/**
 * Unit test for CSVSchemaUpdater.
 *
 * @see CSVSchemaUpdater
 */
public class CSVSchemaUpdaterTest extends AbstractSchemaTestUtils {

    @InjectMocks
    private CSVSchemaUpdater updater;

    @Mock
    private CSVFormatUtils csvFormatUtils;

    @Autowired
    private DataSetMetadataBuilder metadataBuilder;

    @Before
    public void initMocks() {
        MockitoAnnotations.initMocks(this);
    }

    @Test
    public void shouldAccept() throws Exception {
        final DataSetMetadata metadata = metadataBuilder.metadata().id("toto").formatGuessId("formatGuess#csv").build();
        assertTrue(updater.accept(metadata));
    }

    @Test
    public void shouldNoAccept() throws Exception {
        final DataSetMetadata metadata = metadataBuilder.metadata().id("tata").formatGuessId("formatGuess#xls").build();
        assertFalse(updater.accept(metadata));
    }

    @Test
    public void shouldCallCsvFormatUtils() throws Exception {
        final DataSetMetadata original = metadataBuilder.metadata().id("tata").build();
        final DataSetMetadata updated = metadataBuilder.metadata().id("toto").build();
        updater.updateSchema(original, updated);
        verify(csvFormatUtils, times(1)).useNewSeparator(original, updated);
    }
}