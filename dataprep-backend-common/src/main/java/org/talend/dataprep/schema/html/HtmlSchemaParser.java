// ============================================================================
//
// Copyright (C) 2006-2016 Talend Inc. - www.talend.com
//
// This source code is available under agreement available at
// https://github.com/Talend/data-prep/blob/master/LICENSE
//
// You should have received a copy of the agreement
// along with this program; if not, write to Talend SA
// 9 rue Pages 92150 Suresnes, France
//
// ============================================================================

package org.talend.dataprep.schema.html;

import java.io.InputStream;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.Collections;
import java.util.List;
import java.util.Map;

import javax.inject.Inject;

import nu.validator.htmlparser.common.XmlViolationPolicy;
import nu.validator.htmlparser.sax.HtmlParser;

import org.apache.commons.lang.StringUtils;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.talend.dataprep.api.dataset.ColumnMetadata;
import org.talend.dataprep.api.type.Type;
import org.talend.dataprep.exception.TDPException;
import org.talend.dataprep.exception.error.CommonErrorCodes;
import org.talend.dataprep.schema.SchemaParser;
import org.talend.dataprep.schema.SchemaParserResult;
import org.xml.sax.InputSource;

/**
 * This class is in charge of parsing html file (note jsoup is used see http://jsoup.org/ )
 */
@Service("parser#html")
public class HtmlSchemaParser implements SchemaParser {

    /**
     * This class' logger.
     */
    private static final Logger LOGGER = LoggerFactory.getLogger(HtmlSchemaParser.class);

    @Inject
    private HtmlFormatGuesser htmlFormatGuesser;

    /**
     * @see SchemaParser#parse(Request)
     */
    @Override
    public SchemaParserResult parse(Request request) {

        try {

            Map<String, String> parameters = request.getMetadata().getContent().getParameters();
            final String headerSelector = parameters.get(HtmlFormatGuesser.HEADER_SELECTOR_KEY);

            HtmlParser htmlParser = new HtmlParser();

            HeadersContentHandler headersContentHandler = new HeadersContentHandler(headerSelector, false);

            htmlParser.setContentHandler(headersContentHandler);

            InputStream inputStream = request.getContent();

            InputSource inputSource = new InputSource(inputStream);
            // no need to force the encoding the parser will discover it
            // inputSource.setEncoding( encoding );
            htmlParser.parse(inputSource);

            List<ColumnMetadata> columnMetadatas = new ArrayList<>(headersContentHandler.getHeaderValues().size());

            for (String headerValue : headersContentHandler.getHeaderValues()) {

                columnMetadatas.add(ColumnMetadata.Builder.column() //
                        .type(Type.STRING) // TODO ? ATM not doing any complicated type calculation
                        .name(headerValue) //
                        .id(columnMetadatas.size()) //
                        .build());
            }

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
