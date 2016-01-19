package org.talend.dataprep.api.dataset;

import static org.junit.Assert.assertEquals;
import static org.junit.Assert.assertFalse;
import static org.junit.Assert.assertTrue;
import static org.talend.dataprep.api.dataset.ColumnMetadata.Builder.column;
import static org.talend.dataprep.api.dataset.DataSetMetadata.Builder.metadata;

import org.junit.Before;
import org.junit.Test;
import org.talend.dataprep.api.dataset.location.HttpLocation;
import org.talend.dataprep.api.type.Type;
import org.talend.dataprep.schema.SchemaParserResult;

public class DataSetMetadataBuilderTest {

    DataSetMetadata.Builder builder;

    @Before
    public void setUp() throws Exception {
        builder = metadata();
    }

    @Test(expected = IllegalStateException.class)
    public void testExpectedId() {
        builder.build();
    }

    @Test
    public void testId() throws Exception {
        builder.id("1234");
        assertEquals("1234", builder.build().getId());
    }

    @Test
    public void testAuthor() throws Exception {
        builder.id("1234").author("author");
        assertEquals("author", builder.build().getAuthor());
    }

    @Test
    public void testName() throws Exception {
        builder.id("1234").name("name");
        assertEquals("name", builder.build().getName());
    }

    @Test
    public void testCreated() throws Exception {
        builder.id("1234").created(1234);
        assertEquals(1234, builder.build().getCreationDate());
    }

    @Test
    public void testSize() throws Exception {
        builder.id("1234").size(30000);
        assertEquals(30000, builder.build().getContent().getNbRecords());
    }

    @Test
    public void testHeaderSize() throws Exception {
        builder.id("1234").headerSize(1);
        assertEquals(1, builder.build().getContent().getNbLinesInHeader());
    }

    @Test
    public void testFooterSize() throws Exception {
        builder.id("1234").footerSize(1);
        assertEquals(1, builder.build().getContent().getNbLinesInFooter());
    }

    @Test
    public void testContentAnalyzed() throws Exception {
        final DataSetMetadata metadata = builder.id("1234").contentAnalyzed(false).build();
        assertEquals(false, metadata.getLifecycle().contentIndexed());
        metadata.getLifecycle().contentIndexed(true);
        assertEquals(true, metadata.getLifecycle().contentIndexed());
    }

    @Test
    public void testSchemaAnalyzed() throws Exception {
        builder.id("1234").build();
        final DataSetMetadata metadata = builder.id("1234").schemaAnalyzed(false).build();
        assertEquals(false, metadata.getLifecycle().schemaAnalyzed());
        metadata.getLifecycle().schemaAnalyzed(true);
        assertEquals(true, metadata.getLifecycle().schemaAnalyzed());
    }

    @Test
    public void testQualityAnalyzed() throws Exception {
        builder.id("1234").build();
        final DataSetMetadata metadata = builder.id("1234").qualityAnalyzed(false).build();
        assertEquals(false, metadata.getLifecycle().qualityAnalyzed());
        metadata.getLifecycle().qualityAnalyzed(true);
        assertEquals(true, metadata.getLifecycle().qualityAnalyzed());
    }

    @Test
    public void testImporting() throws Exception {
        final DataSetMetadata metadata = builder.id("1234").importing(true).build();
        assertEquals(true, metadata.getLifecycle().importing());
    }

    @Test
    public void testSheetName() throws Exception {
        builder.id("1234").sheetName("test");
        assertEquals("test", builder.build().getSheetName());
    }

    @Test
    public void testDraft() throws Exception {
        builder.id("1234").draft(true);
        assertEquals(true, builder.build().isDraft());
    }

    @Test
    public void testFormatGuessId() throws Exception {
        builder.id("1234").formatGuessId("formatGuess");
        assertEquals("formatGuess", builder.build().getContent().getFormatGuessId());
    }

    @Test
    public void testMediaType() throws Exception {
        builder.id("1234").mediaType("mediaType");
        assertEquals("mediaType", builder.build().getContent().getMediaType());
    }

    @Test
    public void testIsFavorite() throws Exception {
        builder.id("1234").isFavorite(true);
        assertEquals(true, builder.build().isFavorite());
    }

    @Test
    public void testLocation() throws Exception {
        builder.id("1234").location(new HttpLocation());
        assertEquals(HttpLocation.class, builder.build().getLocation().getClass());
    }

    @Test
    public void testCertificationStep() throws Exception {
        builder.id("1234").certificationStep(DataSetGovernance.Certification.CERTIFIED);
        assertEquals(DataSetGovernance.Certification.CERTIFIED, builder.build().getGovernance().getCertificationStep());
    }

    @Test
    public void testCopy() throws Exception {
        final DataSetMetadata build = metadata().id("1234") //
                .row(column().type(Type.STRING).name("col0"), column().type(Type.STRING).name("col1")) //
                .build();
        builder.copy(build);
        final DataSetMetadata metadata = builder.build();
        assertEquals("1234", metadata.getId());
        assertEquals("col0", metadata.getRowMetadata().getColumns().get(0).getName());
        assertEquals("col1", metadata.getRowMetadata().getColumns().get(1).getName());
    }

    @Test
    public void testSchemaParserResult() throws Exception {
        builder.id("1234").schemaParserResult(SchemaParserResult.Builder.parserResult().sheetName("sheetName").build());
        assertEquals("sheetName", builder.build().getSchemaParserResult().getSheetName());
    }


}