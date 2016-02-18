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

package org.talend.dataprep.schema.html;

import java.util.ArrayList;
import java.util.Arrays;
import java.util.Collections;
import java.util.List;
import java.util.Map;
import java.util.Stack;

import javax.inject.Inject;

import nu.validator.htmlparser.sax.HtmlParser;
import org.apache.commons.io.IOUtils;
import org.apache.commons.lang.StringUtils;
import org.jsoup.Jsoup;
import org.jsoup.nodes.Document;
import org.jsoup.nodes.Element;
import org.jsoup.select.Elements;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.talend.dataprep.api.dataset.ColumnMetadata;
import org.talend.dataprep.api.type.Type;
import org.talend.dataprep.exception.TDPException;
import org.talend.dataprep.exception.error.CommonErrorCodes;
import org.talend.dataprep.schema.SchemaParser;
import org.talend.dataprep.schema.SchemaParserResult;
import org.xml.sax.Attributes;
import org.xml.sax.InputSource;
import org.xml.sax.SAXException;
import org.xml.sax.helpers.DefaultHandler;

/**
 * This class is in charge of parsing html file (note jsoup is used see http://jsoup.org/ )
 */
@Service("parser#html")
public class HtmlSchemaParser implements SchemaParser {

    /** This class' logger. */
    private static final Logger LOGGER = LoggerFactory.getLogger(HtmlSchemaParser.class);

    @Inject
    private HtmlFormatGuesser htmlFormatGuesser;

    /**
     * @see SchemaParser#parse(Request)
     */
    @Override
    public SchemaParserResult parse(Request request) {


        try {

            /*

            Map<String, String> parameters = request.getMetadata().getContent().getParameters();
            String encoding = request.getMetadata().getEncoding();
            String headerSelector = parameters.get(HtmlFormatGuesser.HEADER_SELECTOR_KEY);

            String str = IOUtils.toString(request.getContent(), encoding);

            Document document = Jsoup.parse( request.getContent(), encoding, "" );

            Elements headers = document.select(headerSelector);

            List<ColumnMetadata> columnMetadatas = new ArrayList<>();

            int id = 0;

            for (Element header : headers) {
                LOGGER.debug("header: {}", header);
                columnMetadatas.add(ColumnMetadata.Builder.column() //
                        .type(Type.STRING) // TODO ? ATM not doing any complicated type calculation
                        .name(header.text()) //
                        .id(id) //
                        .build());
                id++;
            }
            */

            Map<String, String> parameters = request.getMetadata().getContent().getParameters();
            String encoding = request.getMetadata().getEncoding();
            String headerSelector = parameters.get(HtmlFormatGuesser.HEADER_SELECTOR_KEY);

            //String str = IOUtils.toString(request.getContent(), encoding);

            List<ColumnMetadata> columnMetadatas = new ArrayList<>();

            Stack<String> stack = new Stack<>();

            HtmlParser htmlParser = new HtmlParser(  );

            final String headerPattern = "html body table tr th";

            final List<String> headerStack = Arrays.asList( StringUtils.split( headerPattern, ' ' ) );

            final String valuesPattern =  "html body table tr td";

            final List<String> valuesStack = Arrays.asList( StringUtils.split( valuesPattern, ' ' ) );

            final List<String> subValuesStack = valuesStack.subList( 0, valuesStack.size() -1 );

            htmlParser.setContentHandler( new DefaultHandler()
            {
                private boolean matchingHeaderPatterns;

                private boolean matchingValuesPatterns;

                private List<String> headerValues = new ArrayList<>(  );

                private List<List<String>> contentValues = new ArrayList<>(  );

                @Override
                public void startElement( String uri, String localName, String qName, Attributes atts )
                    throws SAXException
                {
                    stack.push( localName );
                    if (stack.containsAll( headerStack )){
                        matchingHeaderPatterns = true;
                    }

                    if (stack.containsAll( valuesStack )){
                        matchingValuesPatterns = true;
                    }
                }

                @Override
                public void endElement( String uri, String localName, String qName )
                    throws SAXException
                {
                    String top = stack.peek();
                    if ( StringUtils.equals( top, localName )){
                        String removed = stack.pop();
                        if (stack.containsAll( headerStack )){
                            matchingHeaderPatterns = true;
                        } else {
                            matchingHeaderPatterns = false;
                        }

                        if (stack.containsAll( valuesStack )){
                            matchingValuesPatterns = true;
                        } else {
                            matchingValuesPatterns = false;
                        }

                        //new lines of values so create a new List for values ?

                        if (stack.containsAll( subValuesStack ) //
                            && StringUtils.equals( removed, valuesStack.get( valuesStack.size() - 1 ) )) {
                            contentValues.add( new ArrayList<>(  ) );
                        }
                    }
                }

                @Override
                public void characters( char[] ch, int start, int length )
                    throws SAXException
                {
                    // do we really get the whole content once??
                    // we assume yes
                    if (matchingValuesPatterns) {
                        if (contentValues.isEmpty()) {
                            contentValues.add( new ArrayList<>(  ) );
                        }
                        contentValues.get( contentValues.size() - 1 ).add( new String( ch ) );
                    }
                    if(matchingHeaderPatterns){
                        String headerValue = new String( ch );
                        headerValues.add( headerValue );
                        LOGGER.debug("header: {}", new String( ch ));
                        columnMetadatas.add(ColumnMetadata.Builder.column() //
                                                .type(Type.STRING) // TODO ? ATM not doing any complicated type calculation
                                                .name(headerValue) //
                                                .id(columnMetadatas.size()) //
                                                .build());
                    }

                }

                @Override
                public void endDocument()
                    throws SAXException
                {
                    super.endDocument();
                }
            } );

            InputSource inputSource = new InputSource( request.getContent() );
            inputSource.setEncoding( encoding );
            htmlParser.parse( inputSource );
            //htmlParser.parse( new InputSource( this.getClass().getResourceAsStream("sales-force.xls") ) );


            SchemaParserResult.SheetContent sheetContent = new SchemaParserResult.SheetContent();
            sheetContent.setColumnMetadatas(columnMetadatas);

            return SchemaParserResult.Builder.parserResult() //
                    .sheetContents(Collections.singletonList(sheetContent)) //
                    .draft(false) //
                    .build();

        } catch (Exception e) {
            LOGGER.debug("Exception during parsing html request :" + e.getMessage(), e);
            throw new TDPException(CommonErrorCodes.UNEXPECTED_EXCEPTION, e);
        }

    }

}
