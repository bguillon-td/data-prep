package org.talend.dataprep.schema.csv;

import java.io.ByteArrayInputStream;
import java.io.IOException;
import java.io.InputStream;
import java.util.Arrays;
import java.util.List;

import org.junit.Assert;
import org.junit.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.talend.dataprep.api.dataset.ColumnMetadata;
import org.talend.dataprep.api.dataset.DataSetMetadata;
import org.talend.dataprep.schema.AbstractSchemaTestUtils;
import org.talend.dataprep.schema.SchemaParser;
import org.talend.dataprep.schema.SchemaParserResult;

/**
 * Unit test for the CSVSchemaParser class.
 * 
 * @see CSVSchemaParser
 */
public class CSVSchemaParserTest extends AbstractSchemaTestUtils {

    /** The parser to test. */
    @Autowired
    private CSVSchemaParser parser;

    @Autowired
    CSVFormatUtils csvFormatUtils;

    @Test
    public void should_parse_csv() throws IOException {
        try (InputStream inputStream = this.getClass().getResourceAsStream("simple.csv")) {

            final String[] columns = {"first name", "last name"};
            DataSetMetadata datasetMetadata = ioTestUtils.getSimpleDataSetMetadata(columns);
            csvFormatUtils.resetParameters(datasetMetadata, ";", Arrays.asList(columns), 1);

            SchemaParserResult result = parser.parse(new SchemaParser.Request(inputStream, datasetMetadata));
            List<ColumnMetadata> actual = result.getSheetContents().get(0).getColumnMetadatas();

            Assert.assertEquals(datasetMetadata.getRowMetadata().getColumns(), actual);
        }
    }

    /**
     * When trying to guess the columns data type an IndexOutOfBoundsException should not be thrown.
     * @throws IOException
     */
    @Test
    public void TDP_898() throws IOException {
        String str = "c1;c2"+System.lineSeparator()+"1;2;false";
        try (InputStream inputStream = new ByteArrayInputStream(str.getBytes())) {
            final String[] columns = {"c1", "c2"};
            DataSetMetadata datasetMetadata = ioTestUtils.getSimpleDataSetMetadata(columns);
            csvFormatUtils.resetParameters(datasetMetadata, ";", Arrays.asList(columns), 1);
            try {
                parser.parse(new SchemaParser.Request(inputStream, datasetMetadata));
            }
            catch(IndexOutOfBoundsException exc){
                Assert.fail("Should not throw an IndexOutOfBoundsException, when parsing!");
            }
        }
    }

}
