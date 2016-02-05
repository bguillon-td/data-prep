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

package org.talend.dataprep.api.type;

import static org.hamcrest.CoreMatchers.is;
import static org.hamcrest.MatcherAssert.assertThat;
import static org.talend.dataprep.api.dataset.ColumnMetadata.Builder.column;

import static org.talend.dataprep.api.type.TypeUtils.*;

import java.util.Collections;

import org.junit.Test;
import org.talend.dataprep.api.dataset.ColumnMetadata;
import org.talend.dataquality.semantic.classifier.SemanticCategoryEnum;
import org.talend.dataquality.semantic.classifier.custom.UserDefinedCategory;
import org.talend.dataquality.semantic.recognizer.CategoryFrequency;
import org.talend.dataquality.semantic.statistics.SemanticType;
import org.talend.dataquality.statistics.type.DataTypeEnum;


public class TypeUtilsTest {

    @Test
    public void testConvertString() throws Exception {
        ColumnMetadata metadata = column().id(1).type(Type.ANY).build();
        DataTypeEnum[] types = TypeUtils.convert(Collections.singletonList(metadata));
        assertThat(types[0], is(DataTypeEnum.STRING));

        metadata = column().id(2).type(Type.STRING).build();
        types = TypeUtils.convert(Collections.singletonList(metadata));
        assertThat(types[0], is(DataTypeEnum.STRING));
    }

    @Test
    public void testConvertInteger() throws Exception {
        ColumnMetadata metadata = column().id(1).type(Type.NUMERIC).build();
        DataTypeEnum[] types = TypeUtils.convert(Collections.singletonList(metadata));
        assertThat(types[0], is(DataTypeEnum.INTEGER));

        metadata = column().id(2).type(Type.INTEGER).build();
        types = TypeUtils.convert(Collections.singletonList(metadata));
        assertThat(types[0], is(DataTypeEnum.INTEGER));
    }

    @Test
    public void testConvertDouble() throws Exception {
        ColumnMetadata metadata = column().id(1).type(Type.DOUBLE).build();
        DataTypeEnum[] types = TypeUtils.convert(Collections.singletonList(metadata));
        assertThat(types[0], is(DataTypeEnum.DOUBLE));

        metadata = column().id(2).type(Type.FLOAT).build();
        types = TypeUtils.convert(Collections.singletonList(metadata));
        assertThat(types[0], is(DataTypeEnum.DOUBLE));
    }

    @Test
    public void testConvertBoolean() throws Exception {
        ColumnMetadata metadata = column().id(1).type(Type.BOOLEAN).build();
        final DataTypeEnum[] types = TypeUtils.convert(Collections.singletonList(metadata));
        assertThat(types[0], is(DataTypeEnum.BOOLEAN));
    }

    @Test
    public void testConvertDate() throws Exception {
        ColumnMetadata metadata = column().id(1).type(Type.DATE).build();
        final DataTypeEnum[] types = TypeUtils.convert(Collections.singletonList(metadata));
        assertThat(types[0], is(DataTypeEnum.DATE));
    }

    @Test
    public void testSubtype() throws Exception {
        // Sub type
        assertThat(Type.BOOLEAN, is(subTypeOfOther(Type.BOOLEAN, Type.STRING)));
        assertThat(Type.BOOLEAN, is(subTypeOfOther(Type.STRING, Type.BOOLEAN)));
        assertThat(Type.DATE, is(subTypeOfOther(Type.DATE, Type.STRING)));
        assertThat(Type.DATE, is(subTypeOfOther(Type.STRING, Type.DATE)));
        assertThat(Type.INTEGER, is(subTypeOfOther(Type.INTEGER, Type.DOUBLE)));
        assertThat(Type.INTEGER, is(subTypeOfOther(Type.DOUBLE, Type.INTEGER)));
        assertThat(Type.INTEGER, is(subTypeOfOther(Type.INTEGER, Type.STRING)));
        assertThat(Type.INTEGER, is(subTypeOfOther(Type.STRING, Type.INTEGER)));
        assertThat(Type.DOUBLE, is(subTypeOfOther(Type.DOUBLE, Type.STRING)));
        assertThat(Type.DOUBLE, is(subTypeOfOther(Type.STRING, Type.DOUBLE)));
        assertThat(Type.BOOLEAN, is(subTypeOfOther(Type.BOOLEAN, Type.BOOLEAN)));
        assertThat(Type.DATE, is(subTypeOfOther(Type.DATE, Type.DATE)));
        assertThat(Type.INTEGER, is(subTypeOfOther(Type.INTEGER, Type.INTEGER)));
        assertThat(Type.DOUBLE, is(subTypeOfOther(Type.DOUBLE, Type.DOUBLE)));
        assertThat(Type.STRING, is(subTypeOfOther(Type.STRING, Type.STRING)));
        assertThat(Type.BOOLEAN, is(subTypeOfOther(null, Type.BOOLEAN)));
        assertThat(Type.BOOLEAN, is(subTypeOfOther(Type.BOOLEAN, null)));
        assertThat(Type.DATE, is(subTypeOfOther(null, Type.DATE)));
        assertThat(Type.DATE, is(subTypeOfOther(Type.DATE, null)));
        assertThat(Type.INTEGER, is(subTypeOfOther(null, Type.INTEGER)));
        assertThat(Type.INTEGER, is(subTypeOfOther(Type.INTEGER, null)));
        assertThat(Type.DOUBLE, is(subTypeOfOther(null, Type.DOUBLE)));
        assertThat(Type.DOUBLE  , is(subTypeOfOther(Type.DOUBLE, null)));
        assertThat(Type.STRING, is(subTypeOfOther(null, Type.STRING)));
        assertThat(Type.STRING, is(subTypeOfOther(Type.STRING, null)));

        // not subtype
        assertThat(null, is(subTypeOfOther(Type.BOOLEAN, Type.INTEGER)));
        assertThat(null, is(subTypeOfOther(Type.INTEGER, Type.BOOLEAN)));
        assertThat(null, is(subTypeOfOther(Type.DOUBLE, Type.BOOLEAN)));
        assertThat(null, is(subTypeOfOther(Type.BOOLEAN, Type.DOUBLE)));
        assertThat(null, is(subTypeOfOther(Type.BOOLEAN, Type.DATE)));
        assertThat(null, is(subTypeOfOther(Type.DATE, Type.BOOLEAN)));
        assertThat(null, is(subTypeOfOther(Type.DATE, Type.INTEGER)));
        assertThat(null, is(subTypeOfOther(Type.INTEGER, Type.DATE)));
        assertThat(null, is(subTypeOfOther(Type.DOUBLE, Type.DATE)));
        assertThat(null, is(subTypeOfOther(Type.DATE, Type.DOUBLE)));
    }

    @Test
    public void testNullSemanticDomainType() throws Exception {
        assertThat(TypeUtils.getDomainLabel(((SemanticType) null)), is(""));
        assertThat(TypeUtils.getDomainLabel(((String) null)), is(""));
    }

    @Test
    public void testSemanticDomainType() throws Exception {
        final SemanticType semanticType = new SemanticType();
        semanticType.increment(new CategoryFrequency(new UserDefinedCategory(SemanticCategoryEnum.AIRPORT.getId())), 1);
        assertThat(TypeUtils.getDomainLabel(semanticType), is(SemanticCategoryEnum.AIRPORT.getDisplayName()));
        assertThat(TypeUtils.getDomainLabel(SemanticCategoryEnum.AIRPORT.getId()), is(SemanticCategoryEnum.AIRPORT.getDisplayName()));
    }
}
