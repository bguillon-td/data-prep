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

import static org.talend.dataprep.api.type.Type.*;

import java.io.IOException;
import java.io.InputStream;
import java.util.ArrayList;
import java.util.Collections;
import java.util.Iterator;
import java.util.List;
import java.util.Map;
import java.util.OptionalLong;
import java.util.SortedMap;
import java.util.TreeMap;
import java.util.stream.Collectors;

import org.apache.commons.lang.StringUtils;
import org.apache.poi.hssf.usermodel.HSSFDateUtil;
import org.apache.poi.openxml4j.opc.OPCPackage;
import org.apache.poi.ss.usermodel.Cell;
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
import org.slf4j.Marker;
import org.springframework.stereotype.Service;
import org.talend.dataprep.api.dataset.ColumnMetadata;
import org.talend.dataprep.api.type.Type;
import org.talend.dataprep.exception.TDPException;
import org.talend.dataprep.exception.error.CommonErrorCodes;
import org.talend.dataprep.log.Markers;
import org.talend.dataprep.schema.SchemaParser;
import org.talend.dataprep.schema.SchemaParserResult;
import org.xml.sax.ContentHandler;
import org.xml.sax.InputSource;
import org.xml.sax.XMLReader;

import com.ctc.wstx.sax.WstxSAXParserFactory;

/**
 * This class is in charge of parsing excel file (note apache poi is used for reading .xls) see https://poi.apache.org/
 */
@Service("parser#xls")
public class XlsSchemaParser implements SchemaParser {

    /** This class' logger. */
    private static final Logger LOGGER = LoggerFactory.getLogger(XlsSchemaParser.class);

    /** Constant used to record blank cell. */
    private static final String BLANK = "blank";

    /**
     * @see SchemaParser#parse(Request)
     */
    @Override
    public SchemaParserResult parse(Request request) {

        final Marker marker = Markers.dataset(request.getMetadata().getId());

        LOGGER.debug(marker, "parsing {} ");

        // FIXME ATM only first sheet but need to be discuss
        // maybe return List<List<ColumnMetadata>> ??
        // so we could return all sheets

        try
        {
            List<SchemaParserResult.SheetContent> sheetContents = parseAllSheets(request);

            if (!sheetContents.isEmpty()) {
                return sheetContents.size() == 1 ? //
                        SchemaParserResult.Builder.parserResult() //
                                .sheetContents(sheetContents) //
                                .draft(false) //
                                .build() //
                        : //
                        SchemaParserResult.Builder.parserResult() //
                                .sheetContents(sheetContents) //
                                .draft(true) //
                                .sheetName(sheetContents.get(0).getName()) //
                                .build();
            }

            return SchemaParserResult.Builder.parserResult() //
                    .sheetContents(Collections.emptyList()) //
                    .draft(false) //
                    .build();
        } catch (Exception e) {
            LOGGER.debug(marker, "IOException during parsing xls request :" + e.getMessage(), e);
            throw new TDPException(CommonErrorCodes.UNEXPECTED_EXCEPTION, e);
        }

    }

    public List<SchemaParserResult.SheetContent> parseAllSheets(Request request) throws IOException {
       return XlsUtils.isNewExcelFormat(request.getContent())
            ? parseAllSheetsNew(request) : parseAllSheetsOldFormat(request);
       //return parseAllSheetsOldFormat(request);
    }

    /**
     * parse excel document using SAX like technology (only available for modern excel documents)
     * @param request
     * @return
     */
    private List<SchemaParserResult.SheetContent> parseAllSheetsNew(Request request) {

        final Marker marker = Markers.dataset(request.getMetadata().getId());

        List<SchemaParserResult.SheetContent> schemas = new ArrayList<>();

        try {
            OPCPackage container = OPCPackage.open(request.getContent());

            ReadOnlySharedStringsTable strings = new ReadOnlySharedStringsTable(container);
            XSSFReader xssfReader = new XSSFReader(container);

            List<String> activeSheetNames = XlsUtils.getActiveSheetsFromWorkbookSpec( xssfReader.getWorkbookData() );

            StylesTable styles = xssfReader.getStylesTable();

            XSSFReader.SheetIterator iter = (XSSFReader.SheetIterator) xssfReader.getSheetsData();

            int i = 0;

            while (iter.hasNext()) {
                try (InputStream sheetInputStream = iter.next()) {
                    String sheetName = iter.getSheetName();
                    if (!activeSheetNames.contains( sheetName )) {
                        // we ignore non active sheets
                        continue;
                    }

                    if (sheetInputStream.markSupported()){
                        sheetInputStream.mark( 1 );
                    }

                    String dimension = XlsUtils.getDimension( sheetInputStream );

                    sheetInputStream.reset();

                    InputSource sheetSource = new InputSource(sheetInputStream);

                    DefaultSheetContentsHandler defaultSheetContentsHandler = new DefaultSheetContentsHandler( true);

                    XMLReader sheetParser = new WstxSAXParserFactory().newSAXParser().getXMLReader();
                    ContentHandler handler = new XSSFSheetXMLHandler(styles, strings, defaultSheetContentsHandler, true);

                    sheetParser.setContentHandler(handler);
                    try {
                        sheetParser.parse(sheetSource);
                    } catch (FastStopParsingException e) {
                        // expected here
                        LOGGER.debug(marker, "FastStopParsingException");
                    }
                    SchemaParserResult.SheetContent sheetContent = //
                    new SchemaParserResult.SheetContent( StringUtils.isEmpty( sheetName ) ? "sheet-" + i : sheetName, //
                            defaultSheetContentsHandler.columnsMetadata);

                    // the parsing may have not find all columns so we complete using the found dimension
                    int colNum = XlsUtils.getColumnsNumberFromDimension( dimension );

                    List<ColumnMetadata> columnMetadatas = sheetContent.getColumnMetadatas();

                    while (columnMetadatas.size() < colNum) {

                        columnMetadatas.add(ColumnMetadata.Builder //
                                                .column() //
                                                .name("col_" + (columnMetadatas.size() + 1)) //
                                                .type(Type.STRING) //
                                                .build());
                    }

                    schemas.add(sheetContent);
                    i++;
                }
            }
        } catch (Exception e) {
            LOGGER.debug(marker, "IOException during parsing xls request :" + e.getMessage(), e);
            throw new TDPException(CommonErrorCodes.UNEXPECTED_EXCEPTION, e);
        }

        return schemas;
    }

    private static class FastStopParsingException extends RuntimeException {

        public FastStopParsingException() {
            // no op
        }
    }

    static class DefaultSheetContentsHandler implements XSSFSheetXMLHandler.SheetContentsHandler {

        private Logger logger = LoggerFactory.getLogger( getClass() );

        private List<ColumnMetadata> columnsMetadata = new ArrayList<>(  );

        private boolean fastStop;

        public DefaultSheetContentsHandler(boolean fastStop ) {
            this.fastStop = fastStop;
        }

        @Override
        public void cell(String cellReference, String formattedValue, XSSFComment comment) {
            logger.debug( "cell" );
            String headerText = formattedValue;
            // header text cannot be null so use a default one
            if (StringUtils.isEmpty(headerText)) {
                headerText = "col_" + (columnsMetadata.size() + 1); // +1 because it starts from 0
            }

            columnsMetadata.add(ColumnMetadata.Builder //
                                    .column() //
                                    .name(headerText) //
                                    .type(Type.STRING) //
                                    .build());
        }

        @Override
        public void startRow(int rowNum) {
            logger.debug( "startRow" );
            if (rowNum > 0 && fastStop) {
                throw new FastStopParsingException();
            }
        }

        @Override
        public void endRow(int rowNum) {
            logger.debug( "endRow" );
        }

        @Override
        public void headerFooter(String text, boolean isHeader, String tagName) {
            logger.debug( "headerFooter" );
        }
    }

    /**
     * Parse all xls sheets for old excel document type
     *
     * @param request the xls request.
     * @return The parsed sheets request.
     */
    private List<SchemaParserResult.SheetContent> parseAllSheetsOldFormat(Request request) {

        final Marker marker = Markers.dataset(request.getMetadata().getId());

        try {
            Workbook hssfWorkbook = XlsUtils.getWorkbook(request);
            if (hssfWorkbook == null) {
                throw new IOException("could not open " + request.getMetadata().getId() + " as an excel file");
            }

            int sheetNumber = hssfWorkbook.getNumberOfSheets();
            if (sheetNumber < 1) {
                LOGGER.debug(marker, "has not sheet to read");
                return Collections.emptyList();
            }

            List<SchemaParserResult.SheetContent> schemas = new ArrayList<>();
            for (int i = 0; i < sheetNumber; i++) {
                Sheet sheet = hssfWorkbook.getSheetAt(i);

                if (sheet.getLastRowNum() < 1) {
                    LOGGER.debug(marker, "sheet '{}' do not have rows skip ip", sheet.getSheetName());
                    continue;
                }

                List<ColumnMetadata> columnMetadatas = parsePerSheet(sheet, request.getMetadata().getId(), //
                                                                     hssfWorkbook.getCreationHelper().createFormulaEvaluator());

                String sheetName = sheet.getSheetName();

                // update XlsSerializer if this default sheet naming change!!!
                schemas.add(new SchemaParserResult.SheetContent(sheetName == null ? "sheet-" + i : sheetName, columnMetadatas));

            }

            return schemas;

        } catch (IOException e) {
            LOGGER.debug(marker, "IOException during parsing xls request :" + e.getMessage(), e);
            throw new TDPException(CommonErrorCodes.UNEXPECTED_EXCEPTION, e);
        }
    }

    /**
     * Return the columns metadata for the given sheet.
     *
     * @param sheet the sheet to look at.
     * @param datasetId the dataset id.
     * @return the columns metadata for the given sheet.
     */
    private List<ColumnMetadata> parsePerSheet(Sheet sheet, String datasetId, FormulaEvaluator formulaEvaluator) {

        LOGGER.debug(Markers.dataset(datasetId), "parsing sheet '{}'", sheet.getSheetName());

        // Map<ColId, Map<RowId, type>>
        SortedMap<Integer, SortedMap<Integer, String>> cellsTypeMatrix = collectSheetTypeMatrix(sheet, formulaEvaluator);
        int averageHeaderSize = guessHeaderSize(cellsTypeMatrix);

        // here we have information regarding types for each rows/col (yup a Matrix!! :-) )
        // so we can analyse and guess metadata (column type, header value)
        final List<ColumnMetadata> columnsMetadata = new ArrayList<>(cellsTypeMatrix.size());

        cellsTypeMatrix.forEach((colId, typePerRowMap) -> {

            Type type = guessColumnType(colId, typePerRowMap, averageHeaderSize);

            String headerText = "col" + colId;
            if (averageHeaderSize == 1 && sheet.getRow(0) != null) {
                // so header value is the first row of the column
                Cell headerCell = sheet.getRow(0).getCell(colId);
                headerText = XlsUtils.getCellValueAsString(headerCell, formulaEvaluator);
            }

            // header text cannot be null so use a default one
            if (StringUtils.isEmpty(headerText)) {
                headerText = "col_" + (colId + 1); // +1 because it starts from 0
            }

            // FIXME what do we do if header size is > 1 concat all lines?
            columnsMetadata.add(ColumnMetadata.Builder //
                    .column() //
                    .headerSize(averageHeaderSize) //
                    .name(headerText) //
                    .type(type) //
                    .build());

        });

        return columnsMetadata;
    }

    /**
     *
     *
     * @param colId the column id.
     * @param columnRows all rows with previously guessed type: key=row number, value= guessed type
     * @param averageHeaderSize
     * @return
     */
    private Type guessColumnType(Integer colId, SortedMap<Integer, String> columnRows, int averageHeaderSize) {

        // calculate number per type

        Map<String, Long> perTypeNumber = columnRows.tailMap(averageHeaderSize).values() //
                .stream() //
                .collect(Collectors.groupingBy(w -> w, Collectors.counting()));

        OptionalLong maxOccurrence = perTypeNumber.values().stream().mapToLong(Long::longValue).max();

        if (!maxOccurrence.isPresent()) {
            return ANY;
        }

        List<String> duplicatedMax = new ArrayList<>();

        perTypeNumber.forEach((type1, aLong) -> {
            if (aLong >= maxOccurrence.getAsLong()) {
                duplicatedMax.add(type1);
            }
        });

        String guessedType;
        if (duplicatedMax.size() == 1) {
            guessedType = duplicatedMax.get(0);
        } else {
            // as we have more than one type we guess ANY
            guessedType = ANY.getName();
        }

        LOGGER.debug("guessed type for column #{} is {}", colId, guessedType);
        return Type.get(guessedType);
    }

    /**
     * We store (cell types per row) per column.
     *
     * @param sheet key is the column number, value is a Map with key row number and value Type
     * @return A Map&lt;colId, Map&lt;rowId, type&gt;&gt;
     */
    private SortedMap<Integer, SortedMap<Integer, String>> collectSheetTypeMatrix(Sheet sheet, FormulaEvaluator formulaEvaluator) {

        int firstRowNum = sheet.getFirstRowNum();
        int lastRowNum = sheet.getLastRowNum();

        LOGGER.debug("firstRowNum: {}, lastRowNum: {}", firstRowNum, lastRowNum);

        SortedMap<Integer, SortedMap<Integer, String>> cellsTypeMatrix = new TreeMap<>();

        // we start analysing rows
        for (int rowCounter = firstRowNum; rowCounter <= lastRowNum; rowCounter++) {

            int cellCounter = 0;

            Row row = sheet.getRow(rowCounter);
            if (row == null) {
                continue;
            }

            Iterator<Cell> cellIterator = row.cellIterator();

            String currentType;

            while (cellIterator.hasNext()) {
                Cell cell = cellIterator.next();

                int xlsType = Cell.CELL_TYPE_STRING;

                try {
                    xlsType = cell.getCellType() == Cell.CELL_TYPE_FORMULA ? //
                            formulaEvaluator.evaluate(cell).getCellType() : cell.getCellType();
                } catch (Exception e) {
                    // ignore formula error evaluation get as a String with the formula
                }
                switch (xlsType) {
                case Cell.CELL_TYPE_BOOLEAN:
                    currentType = BOOLEAN.getName();
                    break;
                case Cell.CELL_TYPE_NUMERIC:
                    currentType = getTypeFromNumericCell( cell );
                    break;
                case Cell.CELL_TYPE_BLANK:
                    currentType = BLANK;
                    break;
                case Cell.CELL_TYPE_FORMULA:
                case Cell.CELL_TYPE_STRING:
                    currentType = STRING.getName();
                    break;
                case Cell.CELL_TYPE_ERROR:
                    // we cannot really do anything with an error
                default:
                    currentType = ANY.getName();
                }

                SortedMap<Integer, String> cellInfo = cellsTypeMatrix.get(cellCounter);

                if (cellInfo == null) {
                    cellInfo = new TreeMap<>();
                }
                cellInfo.put(rowCounter, currentType);

                cellsTypeMatrix.put(cellCounter, cellInfo);
                cellCounter++;
            }
        }

        LOGGER.trace("cellsTypeMatrix: {}", cellsTypeMatrix);
        return cellsTypeMatrix;
    }

    private String getTypeFromNumericCell(Cell cell) {
        try {
            return HSSFDateUtil.isCellDateFormatted(cell) ? DATE.getName() : NUMERIC.getName();
        } catch (IllegalStateException e) {
            return ANY.getName();
        }
    }

    /**
     * <p>
     * As we can try to be smart and user friendly and not those nerd devs who doesn't mind about users so we try to
     * guess the header size (we assume those bloody users don't have complicated headers!!)
     * </p>
     * <p>
     * We scan all entries to find a common header size value (i.e row line with value type change) more simple all
     * columns/lines with type String
     * </p>
     *
     * @param cellsTypeMatrix key: column number value: row where the type change from String to something else
     * @return The guessed header size.
     */
    private int guessHeaderSize(Map<Integer, SortedMap<Integer, String>> cellsTypeMatrix) {
        SortedMap<Integer, Integer> cellTypeChange = new TreeMap<>();

        cellsTypeMatrix.forEach((colId, typePerRow) -> {

            String firstType = null;
            int rowChange = 0;

            for (Map.Entry<Integer, String> typePerRowEntry : typePerRow.entrySet()) {
                if (firstType == null) {
                    firstType = typePerRowEntry.getValue();
                } else {
                    if (!typePerRowEntry.getValue().equals(firstType) && !typePerRowEntry.getValue().equals(STRING.getName())) {
                        rowChange = typePerRowEntry.getKey();
                        break;
                    }
                }
            }

            cellTypeChange.put(colId, rowChange);

            firstType = null;
            rowChange = 0;

        });

        // average cell type change
        // double averageHeaderSizeDouble =
        // cellTypeChange.values().stream().mapToInt(Integer::intValue).average().getAsDouble();
        // int averageHeaderSize = (int) Math.ceil(averageHeaderSizeDouble);

        // FIXME think more about header size calculation
        // currently can fail so force an header of size 1
        int averageHeaderSize = 1;

        LOGGER.debug("averageHeaderSize (forced to): {}, cellTypeChange: {}", averageHeaderSize, cellTypeChange);

        return averageHeaderSize;
    }


}
