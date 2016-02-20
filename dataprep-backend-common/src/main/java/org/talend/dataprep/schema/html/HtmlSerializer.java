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

import java.io.ByteArrayInputStream;
import java.io.InputStream;
import java.io.StringWriter;
import java.util.List;
import java.util.Map;

import nu.validator.htmlparser.sax.HtmlParser;

import org.apache.commons.io.IOUtils;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.talend.dataprep.api.dataset.ColumnMetadata;
import org.talend.dataprep.api.dataset.DataSetMetadata;
import org.talend.dataprep.exception.TDPException;
import org.talend.dataprep.exception.error.CommonErrorCodes;
import org.talend.dataprep.schema.Serializer;
import org.xml.sax.InputSource;

import com.fasterxml.jackson.core.JsonFactory;
import com.fasterxml.jackson.core.JsonGenerator;

@Service("serializer#html")
public class HtmlSerializer implements Serializer {

    private static final transient Logger LOGGER = LoggerFactory.getLogger(HtmlSerializer.class);

    @Override
    public InputStream serialize(InputStream rawContent, DataSetMetadata metadata) {

        try {

            Map<String, String> parameters = metadata.getContent().getParameters();
            String encoding = metadata.getEncoding();
            String valuesSelector = parameters.get(HtmlFormatGuesser.VALUES_SELECTOR_KEY);

            StringWriter writer = new StringWriter();
            JsonGenerator generator = new JsonFactory().createGenerator(writer);

            generator.writeStartArray();

            List<ColumnMetadata> columns = metadata.getRowMetadata().getColumns();

            ValuesContentHandler valuesContentHandler = new ValuesContentHandler(valuesSelector);

            HtmlParser htmlParser = new HtmlParser();

            htmlParser.setContentHandler(valuesContentHandler);

            htmlParser.parse(new InputSource(rawContent));

            for (List<String> values : valuesContentHandler.getValues()) {

                generator.writeStartObject();

                int idx = 0;

                for (String value : values) {
                    ColumnMetadata columnMetadata = columns.get(idx);
                    generator.writeFieldName(columnMetadata.getId());
                    String cellValue = value;
                    if (cellValue != null) {
                        generator.writeString(cellValue);
                    } else {
                        generator.writeNull();
                    }
                    idx++;
                }
                generator.writeEndObject();
            }

            generator.writeEndArray();
            generator.flush();
            return new ByteArrayInputStream(writer.toString().getBytes("UTF-8"));
        } catch (Exception e) {
            throw new TDPException(CommonErrorCodes.UNABLE_TO_SERIALIZE_TO_JSON, e);
        }

    }
}
