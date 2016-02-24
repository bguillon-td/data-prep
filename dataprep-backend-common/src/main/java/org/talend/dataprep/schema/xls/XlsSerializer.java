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

package org.talend.dataprep.schema.xls;

import java.io.IOException;
import java.io.InputStream;
import java.io.PipedInputStream;
import java.io.PipedOutputStream;
import java.util.ArrayList;
import java.util.List;
import java.util.Locale;
import java.util.Observer;

import javax.annotation.Resource;

import org.apache.commons.lang.StringUtils;
import org.apache.poi.openxml4j.opc.OPCPackage;
import org.apache.poi.ss.usermodel.Cell;
import org.apache.poi.ss.usermodel.DataFormatter;
import org.apache.poi.ss.usermodel.DateUtil;
import org.apache.poi.ss.usermodel.FormulaEvaluator;
import org.apache.poi.ss.usermodel.Row;
import org.apache.poi.ss.usermodel.Sheet;
import org.apache.poi.ss.usermodel.Workbook;
import org.apache.poi.xssf.eventusermodel.ReadOnlySharedStringsTable;
import org.apache.poi.xssf.eventusermodel.XSSFReader;
import org.apache.poi.xssf.eventusermodel.XSSFSheetXMLHandler;
import org.apache.poi.xssf.model.StylesTable;
import org.apache.poi.xssf.usermodel.XSSFComment;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.core.task.TaskExecutor;
import org.springframework.stereotype.Service;
import org.talend.dataprep.api.dataset.ColumnMetadata;
import org.talend.dataprep.api.dataset.DataSetMetadata;
import org.talend.dataprep.exception.TDPException;
import org.talend.dataprep.exception.error.CommonErrorCodes;
import org.talend.dataprep.schema.SchemaParser;
import org.talend.dataprep.schema.Serializer;
import org.xml.sax.ContentHandler;
import org.xml.sax.InputSource;
import org.xml.sax.XMLReader;

import com.ctc.wstx.sax.WstxSAXParserFactory;
import com.fasterxml.jackson.core.JsonFactory;
import com.fasterxml.jackson.core.JsonGenerator;

@Service("serializer#xls")
public class XlsSerializer implements Serializer {

    private static final transient Logger LOGGER = LoggerFactory.getLogger(XlsSerializer.class);

    private final JsonFactory jsonFactory = new JsonFactory();

    @Resource(name = "serializer#excel#executor")
    TaskExecutor executor;    

    @Override
    public InputStream serialize(InputStream rawContent, DataSetMetadata metadata) {
        try {

            PipedInputStream pipe = new PipedInputStream();
            PipedOutputStream jsonOutput = new PipedOutputStream(pipe);

            Runnable runnable = XlsUtils.isNewExcelFormat( rawContent ) ?
                serializeNew( rawContent, metadata, jsonOutput ) : serializeOld( rawContent, metadata, jsonOutput );

            // Serialize asynchronously for better performance (especially if caller doesn't consume all, see sampling).
            executor.execute(runnable);

            return pipe;
        } catch (IOException e) {
            throw new TDPException(CommonErrorCodes.UNABLE_TO_SERIALIZE_TO_JSON, e);
        }
    }

    /*
    public InputStream quickSerialize(InputStream rawContent, DataSetMetadata metadata) throws Exception {

        StringWriter stringWriter = new StringWriter(  );

        JsonGenerator generator = jsonFactory.createGenerator(stringWriter);

        OPCPackage container = OPCPackage.open(rawContent);

        ReadOnlySharedStringsTable strings = new ReadOnlySharedStringsTable(container);
        XSSFReader xssfReader = new XSSFReader(container);

        List<String> activeSheetNames = XlsUtils.getActiveSheetsFromWorkbookSpec(xssfReader.getWorkbookData());

        StylesTable styles = xssfReader.getStylesTable();

        XSSFReader.SheetIterator iter = (XSSFReader.SheetIterator) xssfReader.getSheetsData();

        generator.writeStartArray();

        List<ColumnMetadata> columns = metadata.getRowMetadata().getColumns();

        if (columns != null) {

            while (iter.hasNext()) {
                try (InputStream sheetInputStream = iter.next()) {
                    String sheetName = iter.getSheetName();
                    if (!activeSheetNames.contains(sheetName)
                        || !StringUtils.equals(metadata.getSheetName(), sheetName)) {
                        // we ignore non active sheets
                        continue;
                    }

                    InputSource sheetSource = new InputSource(sheetInputStream);

                    DefaultSheetContentsHandler defaultSheetContentsHandler = new DefaultSheetContentsHandler(generator,
                                                                                                              metadata);

                    XMLReader sheetParser = new WstxSAXParserFactory().newSAXParser().getXMLReader();
                    ContentHandler handler = new XSSFSheetXMLHandler(styles, strings, defaultSheetContentsHandler, false);

                    sheetParser.setContentHandler(handler);
                    sheetParser.parse(sheetSource);

                    // we don't care of other sheets
                    return;
                }
            }

        }
        generator.writeEndArray();

        generator.flush();
    }
    */

    /**
     * serialize method for old xls format (full workbook loaded in memory)
     * 
     * @param rawContent
     * @param metadata
     * @return
     */
    public Runnable serializeNew(InputStream rawContent, DataSetMetadata metadata, PipedOutputStream jsonOutput) {
        Runnable runnable = () -> {
            try {
                JsonGenerator generator = jsonFactory.createGenerator(jsonOutput);

                OPCPackage container = OPCPackage.open(rawContent);

                ReadOnlySharedStringsTable strings = new ReadOnlySharedStringsTable(container);
                XSSFReader xssfReader = new XSSFReader(container);

                List<String> activeSheetNames = XlsUtils.getActiveSheetsFromWorkbookSpec(xssfReader.getWorkbookData());

                StylesTable styles = xssfReader.getStylesTable();

                XSSFReader.SheetIterator iter = (XSSFReader.SheetIterator) xssfReader.getSheetsData();

                generator.writeStartArray();

                List<ColumnMetadata> columns = metadata.getRowMetadata().getColumns();

                if (columns != null) {

                    while (iter.hasNext()) {
                        try (InputStream sheetInputStream = iter.next()) {
                            String sheetName = iter.getSheetName();

                            if (!activeSheetNames.contains(sheetName) //
                                    || ( metadata.getSheetName() != null //
                                        && !StringUtils.equals(metadata.getSheetName(), sheetName) )) {
                                // we ignore non active sheets and non selected one
                                continue;
                            }

                            InputSource sheetSource = new InputSource(sheetInputStream);

                            DefaultSheetContentsHandler defaultSheetContentsHandler = new DefaultSheetContentsHandler(generator,
                                    metadata);


                            XMLReader sheetParser = new WstxSAXParserFactory().newSAXParser().getXMLReader();
                            ContentHandler handler = new XSSFSheetXMLHandler( styles, // 
                                                                              strings, // 
                                                                              defaultSheetContentsHandler, //
                                                                              // in case we want to do our own date number formatting
                                                                              //new CustomDataFormater(),
                                                                              false);

                            sheetParser.setContentHandler(handler);
                            sheetParser.parse(sheetSource);

                            generator.writeEndArray();

                            generator.flush();

                            // we don't care of other sheets
                            return;
                        }
                    }

                }

            } catch (Exception e) {
                // Consumer may very well interrupt consumption of stream (in case of limit(n) use for sampling).
                // This is not an issue as consumer is allowed to partially consumes results, it's up to the
                // consumer to ensure data it consumed is consistent.
                LOGGER.debug("Unable to continue serialization for {}. Skipping remaining content.", metadata.getId(), e);
            } finally {
                try {
                    jsonOutput.close();
                } catch (IOException e) {
                    LOGGER.error("Unable to close output", e);
                }
            }
        };

        return runnable;
    }


    /*
    private static class CustomDataFormater extends DataFormatter {


        public CustomDataFormater()
        {
            super(Locale.FRENCH, false);

        }

        @Override
        public String formatRawCellContents( double value, int formatIndex, String formatString,
                                             boolean use1904Windowing )
        {
               return super.formatRawCellContents( value, formatIndex, formatString, use1904Windowing );
        }

        @Override
        public String formatCellValue( Cell cell, FormulaEvaluator evaluator )
        {
            return super.formatCellValue( cell, evaluator );
        }
    }
    */

    static class DefaultSheetContentsHandler implements XSSFSheetXMLHandler.SheetContentsHandler {

        private Logger logger = LoggerFactory.getLogger(getClass());

        final JsonGenerator generator;

        final DataSetMetadata metadata;

        private int currentRow;

        private boolean headerLine = false;

        private final int columnsNumber;

        private List<String> values;

        public DefaultSheetContentsHandler(JsonGenerator generator, DataSetMetadata metadata) {
            this.generator = generator;
            this.metadata = metadata;
            this.columnsNumber = metadata.getRowMetadata().getColumns().size();
        }

        @Override
        public void cell(String cellReference, String formattedValue, XSSFComment comment) {
            if (!headerLine) {
                logger.trace("cell {} -> {}", cellReference, formattedValue);
                int colNumber = XlsUtils.getColumnsNumberLastCell( cellReference );
                // in case of formula error poi return a string starting with "ERROR:"
                // "ERROR:"
                // FIXME this may be wrong if a user really this!! but we do not have control here
                // except overriding XSSFSheetXMLHandler#endElement
                this.values.set( colNumber - 1, StringUtils.startsWith( formattedValue, "ERROR:" ) ? //
                    StringUtils.EMPTY : formattedValue );
            }

        }

        @Override
        public void startRow(int rowNum) {
            logger.trace("startRow {}", rowNum);
            this.currentRow = rowNum;
            // is header line?
            if (isHeaderLine(this.currentRow, metadata.getRowMetadata().getColumns())) {
                headerLine = true;
            } else {
                this.values = createListWithEmpty(columnsNumber);// new ArrayList<>( columnsNumber );

            }
        }

        @Override
        public void endRow(int rowNum) {
            logger.trace("endRow {}", rowNum);
            if (!headerLine) {
                try {
                    generator.writeStartObject();
                    for (int j = 0; j < metadata.getRowMetadata().getColumns().size(); j++) {
                        ColumnMetadata columnMetadata = metadata.getRowMetadata().getColumns().get(j);

                        //int colId = Integer.valueOf(columnMetadata.getId());
                        String cellValue = this.values.get(j);
                        generator.writeFieldName(columnMetadata.getId());
                        if (cellValue != null) {
                            generator.writeString(cellValue);
                        } else {
                            generator.writeNull();
                        }
                    }
                    generator.writeEndObject();
                } catch (IOException e) {
                    throw new TDPException(CommonErrorCodes.UNABLE_TO_SERIALIZE_TO_JSON, e);
                }

            }
            headerLine = false;
        }

        private List<String> createListWithEmpty( int size) {
            List<String> list = new ArrayList<>( size );
            for (int i = 0; i < size; i++){
                list.add( StringUtils.EMPTY );
            }
            return list;
        }

        @Override
        public void headerFooter(String text, boolean isHeader, String tagName) {
            logger.trace("headerFooter");
        }
    }

    /**
     * serialize method for old xls format (full workbook loaded in memory)
     * 
     * @param rawContent
     * @param metadata
     * @return
     */
    public Runnable serializeOld(InputStream rawContent, DataSetMetadata metadata, PipedOutputStream jsonOutput) throws IOException {

        Runnable runnable = () -> {
            try {
                Workbook workbook = XlsUtils.getWorkbook(new SchemaParser.Request(rawContent, metadata));

                JsonGenerator generator = jsonFactory.createGenerator(jsonOutput);

                // if no sheet name just get the first one (take it easy mate :-) )
                Sheet sheet = StringUtils.isEmpty(metadata.getSheetName()) ? workbook.getSheetAt(0)
                        : //
                        workbook.getSheet(metadata.getSheetName());

                if (sheet == null) {
                    // auto generated sheet name so take care!! "sheet-" + i
                    if (StringUtils.startsWith(metadata.getSheetName(), "sheet-")) {
                        String sheetNumberStr = StringUtils.removeStart(metadata.getSheetName(), "sheet-");

                        sheet = workbook.getSheetAt(Integer.valueOf(sheetNumberStr));
                    }
                    // still null so use the first one
                    if (sheet == null) {
                        sheet = workbook.getSheetAt(0);
                    }
                }

                generator.writeStartArray();

                List<ColumnMetadata> columns = metadata.getRowMetadata().getColumns();

                if (columns != null) {
                    
                    for (int i = 0, size = sheet.getLastRowNum(); i <= size; i++) {

                        // is header line?
                        if (isHeaderLine(i, columns)) {
                            continue;
                        }

                        Row row = sheet.getRow(i);
                        if (row != null) {
                            generator.writeStartObject();
                            for (int j = 0; j < columns.size(); j++) {
                                ColumnMetadata columnMetadata = columns.get(j);

                                // do not write the values if this has been detected as an header
                                if (i < columnMetadata.getHeaderSize()) {
                                    continue;
                                }

                                int colId = Integer.valueOf(columnMetadata.getId());
                                String cellValue = XlsUtils.getCellValueAsString(row.getCell(colId), //
                                        workbook.getCreationHelper().createFormulaEvaluator());
                                LOGGER.trace("cellValue for {}/{}: {}", i, colId, cellValue);
                                generator.writeFieldName(columnMetadata.getId());
                                if (cellValue != null) {
                                    generator.writeString(cellValue);
                                } else {
                                    generator.writeNull();
                                }
                            }
                            generator.writeEndObject();

                        }

                    }
                }

                generator.writeEndArray();
                generator.flush();
            } catch (Exception e) {
                // Consumer may very well interrupt consumption of stream (in case of limit(n) use for sampling).
                // This is not an issue as consumer is allowed to partially consumes results, it's up to the
                // consumer to ensure data it consumed is consistent.
                LOGGER.debug("Unable to continue serialization for {}. Skipping remaining content.", metadata.getId(), e);
            } finally {
                try {
                    jsonOutput.close();
                } catch (IOException e) {
                    LOGGER.error("Unable to close output", e);
                }
            }
        };
        return runnable;

    }

    protected static boolean isHeaderLine(int lineIndex, List<ColumnMetadata> columns) {
        boolean headerLine = false;
        for (ColumnMetadata columnMetadata : columns) {
            if (lineIndex < columnMetadata.getHeaderSize()) {
                headerLine = true;
            }
        }
        return headerLine;
    }

}
