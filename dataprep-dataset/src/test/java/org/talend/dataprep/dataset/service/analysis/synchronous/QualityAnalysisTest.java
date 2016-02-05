//  ============================================================================
//
//  Copyright (C) 2006-2016 Talend Inc. - www.talend.com
//
//  This source code is available under agreement available at
//  https://github.com/Talend/data-prep/blob/master/LICENSE
//
//  You should have received a copy of the agreement
//  along with this program; if not, write to Talend SA
//  9 rue Pages 92150 Suresnes, France
//
//  ============================================================================

package org.talend.dataprep.dataset.service.analysis.synchronous;

import static org.hamcrest.CoreMatchers.is;
import static org.hamcrest.CoreMatchers.nullValue;
import static org.junit.Assert.assertThat;

import java.io.InputStream;
import java.util.HashSet;
import java.util.Random;
import java.util.Set;

import org.junit.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.talend.dataprep.api.dataset.ColumnMetadata;
import org.talend.dataprep.api.dataset.DataSetMetadata;
import org.talend.dataprep.api.dataset.Quality;
import org.talend.dataprep.api.type.Type;
import org.talend.dataprep.dataset.DataSetBaseTest;
import org.talend.dataprep.dataset.service.DataSetServiceTests;

public class QualityAnalysisTest extends DataSetBaseTest {

    @Autowired
    FormatAnalysis formatAnalysis;

    @Autowired
    QualityAnalysis qualityAnalysis;

    @Autowired
    SchemaAnalysis schemaAnalysis;

    @Autowired
    ContentAnalysis contentAnalysis;

    /** Random to generate random dataset id. */
    private Random random = new Random();

    @Test
    public void testNoDataSetFound() throws Exception {
        qualityAnalysis.analyze("1234");
        assertThat(dataSetMetadataRepository.get("1234"), nullValue());
    }

    @Test
    public void testAnalysis() throws Exception {
        final DataSetMetadata metadata = metadataBuilder.metadata().id("1234").build();
        dataSetMetadataRepository.add(metadata);
        contentStore.storeAsRaw(metadata, DataSetServiceTests.class.getResourceAsStream("../avengers.csv"));
        formatAnalysis.analyze("1234");
        contentAnalysis.analyze("1234");
        schemaAnalysis.analyze("1234");
        // Analyze quality
        qualityAnalysis.analyze("1234");
        final DataSetMetadata actual = dataSetMetadataRepository.get("1234");
        assertThat(actual.getLifecycle().qualityAnalyzed(), is(true));
        assertThat(actual.getContent().getNbRecords(), is(5L));
        for (ColumnMetadata column : actual.getRowMetadata().getColumns()) {
            final Quality quality = column.getQuality();
            assertThat(quality.getValid(), is(5));
            assertThat(quality.getInvalid(), is(0));
            assertThat(quality.getEmpty(), is(0));
        }
    }

    @Test
    public void testAnalysisWithInvalidValues() throws Exception {
        String dsId = "4321";
        final DataSetMetadata metadata = metadataBuilder.metadata().id(dsId).build();
        dataSetMetadataRepository.add(metadata);
        contentStore.storeAsRaw(metadata, DataSetServiceTests.class.getResourceAsStream("../dataset_with_invalid_records.csv"));
        formatAnalysis.analyze(dsId);
        contentAnalysis.analyze(dsId);
        schemaAnalysis.analyze(dsId);
        // Analyze quality
        qualityAnalysis.analyze(dsId);
        final DataSetMetadata actual = dataSetMetadataRepository.get(dsId);
        assertThat(actual.getLifecycle().qualityAnalyzed(), is(true));
        assertThat(actual.getContent().getNbRecords(), is(9L));
        assertThat(actual.getRowMetadata().getColumns().size(), is(2));
        ColumnMetadata secondColumn = actual.getRowMetadata().getColumns().get(1);
        Quality quality = secondColumn.getQuality();
        assertThat(quality.getValid(), is(6));
        assertThat(quality.getInvalid(), is(2));
        assertThat(quality.getEmpty(), is(1));

        Set<String> expectedInvalidValues = new HashSet<>(1);
        expectedInvalidValues.add("N/A");
        assertThat(quality.getInvalidValues(), is(expectedInvalidValues));

    }

    /**
     * This test ensures that data types have been rightly detected when performing a full analysis.
     *
     * See <a href="https://jira.talendforge.org/browse/TDP-224">https://jira.talendforge.org/browse/TDP-1150</a>.
     *
     * @throws Exception
     */
    @Test
    public void TDP_1150_full() throws Exception {
        final DataSetMetadata actual = initializeDataSetMetadata(
                DataSetServiceTests.class.getResourceAsStream("../invalids_and_type_detection.csv"));
        assertThat(actual.getLifecycle().schemaAnalyzed(), is(true));
        String[] expectedNames = {  "string_boolean", "double_integer", "string_integer", "string_double", "string_date",
                "type_mix", "boolean", "integer", "double", "date", "string", "empty"};
        Type[] expectedTypes = { Type.BOOLEAN, Type.INTEGER, Type.INTEGER, Type.DOUBLE, Type.DATE, Type.STRING, Type.BOOLEAN,
                Type.INTEGER, Type.DOUBLE, Type.DATE,Type.STRING, Type.STRING };
        int i = 0;
        int j = 0;
        for (ColumnMetadata column : actual.getRowMetadata().getColumns()) {
            assertThat(column.getName(), is(expectedNames[i++]));
            assertThat(column.getType(), is(expectedTypes[j++].getName()));
        }
    }

    /**
     * Initialize a dataset with the given content. Perform the format and the schema analysis.
     *
     * @param content the dataset content.
     * @return the analyzed dataset metadata.
     */
    private DataSetMetadata initializeDataSetMetadata(InputStream content) {
        String id = String.valueOf(random.nextInt(10000));
        final DataSetMetadata metadata = metadataBuilder.metadata().id(id).build();
        dataSetMetadataRepository.add(metadata);
        contentStore.storeAsRaw(metadata, content);
        formatAnalysis.analyze(id);
        contentAnalysis.analyze(id);
        schemaAnalysis.analyze(id);
        // Analyze quality
        qualityAnalysis.analyze(id);

        final DataSetMetadata analyzed = dataSetMetadataRepository.get(id);
        assertThat(analyzed.getLifecycle().schemaAnalyzed(), is(true));
        return analyzed;
    }
}
