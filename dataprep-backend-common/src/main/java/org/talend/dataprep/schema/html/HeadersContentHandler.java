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

import java.util.ArrayDeque;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;

import org.apache.commons.lang.StringUtils;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.xml.sax.Attributes;
import org.xml.sax.SAXException;
import org.xml.sax.helpers.DefaultHandler;

/**
 * ContentHandler to get headers values
 */
public class HeadersContentHandler extends DefaultHandler {

    private static final Logger LOGGER = LoggerFactory.getLogger(HtmlSchemaParser.class);

    private final ArrayDeque<String> stack = new ArrayDeque<>();

    private boolean matchingHeaderPattern;

    private List<String> headerValues = new ArrayList<>();

    private final List<String> headerStack;

    /**
     * flag to manage empty cells (empty String as value)
     */
    private boolean valueFound;

    /**
     * if <code>true</code>
     */
    private boolean fastStop;

    /**
     *
     * @param headerSelector an html element selector corresponding to headers "html body table tr th" <b>attributes not
     * supported</b>
     * @param fastStop to stop the parsing once header selector has been reached once
     */
    public HeadersContentHandler(String headerSelector, boolean fastStop) {
        this.headerStack = Arrays.asList(StringUtils.split(headerSelector, ' '));
        this.fastStop = fastStop;
    }

    /**
     * Exception throw when reaching once the header pattern. Faster to only guess the content
     */
    public static class FastContentHandlerStopException extends RuntimeException {

        public FastContentHandlerStopException() {
            // no op
        }
    }

    public List<String> getHeaderValues() {
        return headerValues;
    }

    @Override
    public void startElement(String uri, String localName, String qName, Attributes atts) throws SAXException {
        stack.addLast(localName);
        if (stack.containsAll(headerStack)) {
            matchingHeaderPattern = true;
        }
        valueFound = false;
    }

    @Override
    public void endElement(String uri, String localName, String qName) throws SAXException {
        String top = stack.getLast();
        if (StringUtils.equals(top, localName)) {
            if (stack.containsAll(headerStack)) {
                if (this.fastStop) {
                    throw new FastContentHandlerStopException();
                }
                matchingHeaderPattern = true;
            } else {
                matchingHeaderPattern = false;
            }
        }
        valueFound = false;
        stack.removeLast();
    }

    @Override
    public void characters(char[] ch, int start, int length) throws SAXException {
        if (matchingHeaderPattern) {
            String headerValue = new String(ch);
            if (!valueFound) {
                headerValues.add(headerValue);
            } else {
                // characters method is called with some buffering so can be called multiple time whereas it's the same
                // cell.
                headerValues.set(headerValues.size() - 1, headerValues.get(headerValues.size() - 1) + headerValue);
            }
            LOGGER.debug("header: {}", headerValue);
        }
        valueFound = true;
    }

}
