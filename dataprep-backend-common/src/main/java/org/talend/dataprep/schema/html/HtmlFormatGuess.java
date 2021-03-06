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

import javax.inject.Inject;

import org.springframework.stereotype.Component;
import org.talend.dataprep.schema.DraftValidator;
import org.talend.dataprep.schema.FormatGuess;
import org.talend.dataprep.schema.SchemaParser;
import org.talend.dataprep.schema.Serializer;

@Component(HtmlFormatGuess.BEAN_ID)
public class HtmlFormatGuess implements FormatGuess {

    // TODO Html content is not Excel, but currently only HTML content wrapped in Excel is supported, thus this MIME.
    public static final String MEDIA_TYPE = "application/vnd.ms-excel";

    public static final String BEAN_ID = "formatGuess#html";

    @Inject
    private HtmlSchemaParser schemaParser;

    @Inject
    private HtmlSerializer htmlSerializer;

    @Override
    public String getMediaType() {
        return MEDIA_TYPE;
    }

    @Override
    public float getConfidence() {
        return 1;
    }

    @Override
    public SchemaParser getSchemaParser() {
        return schemaParser;
    }

    @Override
    public Serializer getSerializer() {
        return htmlSerializer;
    }

    @Override
    public DraftValidator getDraftValidator() {
        throw new UnsupportedOperationException();
    }

    @Override
    public String getBeanId() {
        return BEAN_ID;
    }
}
