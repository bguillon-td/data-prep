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
import java.util.Collections;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import javax.inject.Inject;

import nu.validator.htmlparser.common.XmlViolationPolicy;
import nu.validator.htmlparser.sax.HtmlParser;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Component;
import org.talend.dataprep.schema.FormatGuesser;
import org.talend.dataprep.schema.SchemaParser;
import org.talend.dataprep.schema.unsupported.UnsupportedFormatGuess;
import org.xml.sax.InputSource;

@Component("formatGuesser#html")
public class HtmlFormatGuesser implements FormatGuesser {

    private static final Logger LOGGER = LoggerFactory.getLogger(HtmlFormatGuesser.class);

    private List<Pattern> patterns;

    static final String HEADER_SELECTOR_KEY = "html.HEADER_SELECTOR_KEY";

    static final String VALUES_SELECTOR_KEY = "html.VALUES_SELECTOR_KEY";

    @Inject
    private HtmlFormatGuess htmlFormatGuess;

    /** The fallback guess if the input is not Excel compliant. */
    @Inject
    private UnsupportedFormatGuess fallbackGuess;

    public HtmlFormatGuesser() {
        patterns = new ArrayList<>(1);
        patterns.add(new Pattern("html body table tbody tr th", "html body table tbody tr td"));
    }

    @Override
    public Result guess(SchemaParser.Request request, String encoding) {
        if (request == null || request.getContent() == null) {
            throw new IllegalArgumentException("Content cannot be null.");
        }

        try {
            for (Pattern pattern : patterns) {

                HtmlParser htmlParser = new HtmlParser();

                htmlParser.setStreamabilityViolationPolicy( XmlViolationPolicy.FATAL );

                HeadersContentHandler headersContentHandler = new HeadersContentHandler(pattern.getHeaderSelector(), true);

                htmlParser.setContentHandler(headersContentHandler);

                InputStream inputStream = request.getContent();

                InputSource inputSource = new InputSource(inputStream);
                // no need to force the encoding the parser will discover it
                // inputSource.setEncoding( encoding );
                try {
                    htmlParser.parse(inputSource);
                } catch (HeadersContentHandler.FastContentHandlerStopException e) {
                    // save patterns found for the schema parser
                    Map<String, String> parameters = new HashMap<>(2);
                    parameters.put(HEADER_SELECTOR_KEY, pattern.getHeaderSelector());
                    parameters.put(VALUES_SELECTOR_KEY, pattern.getValuesSelector());
                    return new FormatGuesser.Result(htmlFormatGuess, encoding, parameters);
                }
            }

        } catch (Exception e) {
            LOGGER.debug("fail to read content: " + e.getMessage(), e);
        }

        return new Result(fallbackGuess, "UTF-8", Collections.emptyMap());
    }

    protected List<Pattern> getPatterns() {
        return patterns;
    }

    static class Pattern {

        private String headerSelector;

        private String valuesSelector;

        public Pattern(String headerSelector, String valuesSelector) {
            this.headerSelector = headerSelector;
            this.valuesSelector = valuesSelector;
        }

        public String getHeaderSelector() {
            return headerSelector;
        }

        public String getValuesSelector() {
            return valuesSelector;
        }
    }
}
