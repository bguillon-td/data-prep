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

import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;
import java.util.Stack;

import org.apache.commons.lang.StringUtils;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.xml.sax.Attributes;
import org.xml.sax.SAXException;
import org.xml.sax.helpers.DefaultHandler;

/**
 * ContentHandler to get values from the selector
 */
public class ValuesContentHandler extends DefaultHandler {

    private static final Logger LOGGER = LoggerFactory.getLogger(HtmlSchemaParser.class);

    private final Stack<String> stack = new Stack<>();

    private boolean matchingValuePattern;

    /**
     * list of row values
     */
    private List<List<String>> values = new ArrayList<>();

    private final List<String> valueStack;

    /**
     *
     * @param valueSelector an html element selector corresponding to values "html body table tr td" <b>attributes not
     * supported</b>
     */
    public ValuesContentHandler(String valueSelector) {
        this.valueStack = Arrays.asList(StringUtils.split(valueSelector, ' '));
    }

    public List<List<String>> getValues() {
        return values;
    }

    @Override
    public void startElement(String uri, String localName, String qName, Attributes atts) throws SAXException {
        stack.push(localName);
        if (stack.containsAll(valueStack)) {
            matchingValuePattern = true;
        }
    }

    @Override
    public void endElement(String uri, String localName, String qName) throws SAXException {
        String top = stack.peek();
        if (StringUtils.equals(top, localName)) {
            if (stack.containsAll(valueStack)) {
                matchingValuePattern = true;
            } else {
                matchingValuePattern = false;
            }
        }
        stack.pop();
    }

    @Override
    public void characters(char[] ch, int start, int length) throws SAXException {
        // do we really get the whole content once??
        // we assume yes
        if (matchingValuePattern) {
            String value = new String(ch);
            LOGGER.debug("value: {}", value);

        }

    }

    @Override
    public void endDocument() throws SAXException {
        super.endDocument();
    }

}
