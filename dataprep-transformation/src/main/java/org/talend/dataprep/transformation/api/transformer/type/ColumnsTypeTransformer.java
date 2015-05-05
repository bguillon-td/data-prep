package org.talend.dataprep.transformation.api.transformer.type;

import java.io.IOException;
import java.io.StringWriter;
import java.util.List;
import java.util.function.Consumer;

import com.fasterxml.jackson.core.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.converter.json.Jackson2ObjectMapperBuilder;
import org.springframework.stereotype.Component;
import org.talend.dataprep.api.dataset.ColumnMetadata;
import org.talend.dataprep.exception.Exceptions;
import org.talend.dataprep.transformation.exception.TransformationMessages;

import com.fasterxml.jackson.databind.ObjectReader;

/**
 * Columns array Serializer
 */
@Component
public class ColumnsTypeTransformer implements TypeTransformer<ColumnMetadata> {

    @Autowired
    private Jackson2ObjectMapperBuilder builder;

    @Override
    public void process(final JsonParser parser, final JsonGenerator generator, final List<Integer> indexes, final boolean preview, final Consumer<ColumnMetadata>... actions) {
        try {
            final StringWriter content = new StringWriter();
            final JsonGenerator contentGenerator = new JsonFactory().createGenerator(content);

            JsonToken nextToken;
            while ((nextToken = parser.nextToken()) != null) {
                // TODO nextToken == JsonToken.VALUE_EMBEDDED_OBJECT
                switch (nextToken) {
                // Object delimiter
                case START_OBJECT:
                    contentGenerator.writeStartObject();
                    break;
                case END_OBJECT:
                    contentGenerator.writeEndObject();
                    break;

                // Fields key/value
                case FIELD_NAME:
                    contentGenerator.writeFieldName(parser.getText());
                    break;
                case VALUE_FALSE:
                    contentGenerator.writeBoolean(false);
                    break;
                case VALUE_TRUE:
                    contentGenerator.writeBoolean(true);
                    break;
                case VALUE_NUMBER_FLOAT:
                    contentGenerator.writeNumber(parser.getNumberValue().floatValue());
                    break;
                case VALUE_NUMBER_INT:
                    contentGenerator.writeNumber(parser.getNumberValue().intValue());
                    break;
                case VALUE_STRING:
                    contentGenerator.writeString(parser.getText());
                    break;

                // Array delimiter : on array end, we consider the column part ends
                case START_ARRAY:
                    contentGenerator.writeStartArray();
                    break;
                case END_ARRAY:
                    contentGenerator.writeEndArray();
                    contentGenerator.flush();

                    final List<ColumnMetadata> columns = getColumnsMetadata(content);
                    transform(columns, actions);
                    write(generator, columns);

                    return;
                }
            }

        } catch (JsonParseException e) {
            throw Exceptions.Internal(TransformationMessages.UNABLE_TO_PARSE_JSON, e);
        } catch (IOException e) {
            throw Exceptions.Internal(TransformationMessages.UNABLE_TO_WRITE_JSON, e);
        }
    }

    /**
     * Apply columns transformations
     *  @param columns - the columns list
     * @param action - transformation action
     */
    // TODO Temporary: actions may transform columns, for now just print them as is
    private void transform(final List<ColumnMetadata> columns, final Consumer<ColumnMetadata>... action) {
    }

    /**
     * Convert String to list of ColumnMetadataObject
     * 
     * @param content - the String writer that contains JSON format array
     * @throws IOException
     */
    private List<ColumnMetadata> getColumnsMetadata(final StringWriter content) throws IOException {
        final ObjectReader columnReader = builder.build().reader(ColumnMetadata.class);
        return columnReader.<ColumnMetadata> readValues(content.toString()).readAll();
    }
}