// ============================================================================
//
// Copyright (C) 2006-2014 Talend Inc. - www.talend.com
//
// This source code is available under agreement available at
// %InstallDIR%\features\org.talend.rcp.branding.%PRODUCTNAME%\%PRODUCTNAME%license.txt
//
// You should have received a copy of the agreement
// along with this program; if not, write to Talend SA
// 9 rue Pages 92150 Suresnes, France
//
// ============================================================================
package org.talend.dataprep.transformation.api.action.metadata.math;

import static org.hamcrest.CoreMatchers.is;
import static org.junit.Assert.*;
import static org.talend.dataprep.api.dataset.ColumnMetadata.Builder.column;
import static org.talend.dataprep.transformation.api.action.metadata.ActionMetadataTestUtils.getColumn;

import java.io.IOException;
import java.util.HashMap;
import java.util.Map;

import org.junit.Test;
import org.talend.dataprep.api.dataset.ColumnMetadata;
import org.talend.dataprep.api.dataset.DataSetRow;
import org.talend.dataprep.api.type.Type;
import org.talend.dataprep.transformation.api.action.DataSetRowAction;
import org.talend.dataprep.transformation.api.action.context.TransformationContext;
import org.talend.dataprep.transformation.api.action.metadata.ActionMetadataTestUtils;
import org.talend.dataprep.transformation.api.action.metadata.category.ActionCategory;

/**
 * Test class for Round action. Creates one consumer, and test it.
 *
 * @see Round
 */
public class RoundTest {

    /** The action ton test. */
    private Round roundAction;

    /** The consumer out of the consumer. */
    private DataSetRowAction consumer;

    /**
     * Constructor.
     */
    public RoundTest() throws IOException {
        roundAction = new Round();
        Map<String, String> parameters = ActionMetadataTestUtils //
                .parseParameters(roundAction, RoundTest.class.getResourceAsStream("roundAction.json"));
        consumer = roundAction.create(parameters).getRowAction();
    }

    @Test
    public void testAdapt() throws Exception {
        assertThat(roundAction.adapt(null), is(roundAction));
        ColumnMetadata column = column().name("myColumn").id(0).type(Type.STRING).build();
        assertThat(roundAction.adapt(column), is(roundAction));
    }

    @Test
    public void testCategory() throws Exception {
        assertThat(roundAction.getCategory(), is(ActionCategory.MATH.getDisplayName()));
    }


    public void testCommon(String input, String expected) {
        Map<String, String> values = new HashMap<>();
        values.put("aNumber", input);
        DataSetRow dsr = new DataSetRow(values);

        dsr = consumer.apply(dsr, new TransformationContext());
        assertEquals(expected, dsr.get("aNumber"));
    }

    @Test
    public void testPositive() {
        testCommon("5.0", "5");
        testCommon("5.1", "5");
        testCommon("5.5", "6");
        testCommon("5.8", "6");
    }

    @Test
    public void testNegative() {
        testCommon("-5.0", "-5");
        testCommon("-5.4", "-5");
        testCommon("-5.6", "-6");
    }

    @Test
    public void testInteger() {
        testCommon("5", "5");
        testCommon("-5", "-5");
    }

    @Test
    public void testString() {
        testCommon("tagada", "tagada");
        testCommon("", "");
        testCommon("null", "null");
    }

    @Test
    public void should_accept_column() {
        assertTrue(roundAction.acceptColumn(getColumn(Type.NUMERIC)));
        assertTrue(roundAction.acceptColumn(getColumn(Type.INTEGER)));
        assertTrue(roundAction.acceptColumn(getColumn(Type.DOUBLE)));
        assertTrue(roundAction.acceptColumn(getColumn(Type.FLOAT)));
    }

    @Test
    public void should_not_accept_column() {
        assertFalse(roundAction.acceptColumn(getColumn(Type.STRING)));
        assertFalse(roundAction.acceptColumn(getColumn(Type.DATE)));
        assertFalse(roundAction.acceptColumn(getColumn(Type.BOOLEAN)));
    }
}
