package org.talend.dataprep.schema.io;

import java.io.ByteArrayInputStream;
import java.io.IOException;
import java.io.InputStream;
import java.io.StringWriter;
import java.util.List;

import org.apache.poi.ss.usermodel.Row;
import org.apache.poi.ss.usermodel.Sheet;
import org.apache.poi.ss.usermodel.Workbook;
import org.codehaus.jackson.JsonFactory;
import org.codehaus.jackson.JsonGenerator;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.talend.dataprep.api.dataset.ColumnMetadata;
import org.talend.dataprep.api.dataset.DataSetMetadata;
import org.talend.dataprep.schema.Serializer;

@Service("serializer#xls")
public class XlsSerializer implements Serializer {

    private transient static final Logger LOGGER = LoggerFactory.getLogger(XlsSerializer.class);

    @Override
    public InputStream serialize(InputStream rawContent, DataSetMetadata metadata) {

        try {

            Workbook workbook = XlsUtils.getWorkbook(rawContent);

            StringWriter writer = new StringWriter();
            JsonGenerator generator = new JsonFactory().createJsonGenerator(writer);

            // FIXME: ATM we work with only one sheet
            Sheet sheet = workbook.getSheetAt(metadata.getSheetNumber());

            generator.writeStartArray();

            List<ColumnMetadata> columns = metadata.getRow().getColumns();

            for (int i = 0, size = sheet.getLastRowNum(); i <= size; i++) {

                // is header line?
                if (isHeaderLine(i, columns)) {
                    continue;
                }

                Row row = sheet.getRow(i);

                generator.writeStartObject();
                for (int j = 0; j < columns.size(); j++) {
                    ColumnMetadata columnMetadata = columns.get(j);

                    // do not write the values if this has been detected as an header
                    if (i >= columnMetadata.getHeaderSize()) {
                        String cellValue = XlsUtils.getCellValueAsString(row.getCell(j));
                        LOGGER.trace( "cellValue for {}/{}: {}", i, j, cellValue );
                        generator.writeStringField(columnMetadata.getId(), cellValue);
                    }
                }
                generator.writeEndObject();

            }

            generator.writeEndArray();
            generator.flush();
            return new ByteArrayInputStream(writer.toString().getBytes("UTF-8"));
        } catch (IOException e) {
            throw new RuntimeException("Unable to serialize to JSON.", e);
        }

    }

    protected boolean isHeaderLine(int lineIndex, List<ColumnMetadata> columns) {
        boolean headerLine = false;
        for (ColumnMetadata columnMetadata : columns) {
            if (lineIndex < columnMetadata.getHeaderSize()) {
                headerLine = true;
            }
        }
        return headerLine;
    }

}