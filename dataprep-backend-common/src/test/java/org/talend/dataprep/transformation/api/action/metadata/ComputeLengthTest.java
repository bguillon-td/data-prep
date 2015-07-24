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
package org.talend.dataprep.transformation.api.action.metadata;

import static org.hamcrest.CoreMatchers.is;
import static org.junit.Assert.*;
import static org.talend.dataprep.api.dataset.ColumnMetadata.Builder.column;
import static org.talend.dataprep.transformation.api.action.metadata.ActionMetadataTestUtils.getColumn;

import java.io.IOException;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.junit.Test;
import org.talend.dataprep.api.dataset.ColumnMetadata;
import org.talend.dataprep.api.dataset.DataSetRow;
import org.talend.dataprep.api.dataset.RowMetadata;
import org.talend.dataprep.api.preparation.Action;
import org.talend.dataprep.api.type.Type;
import org.talend.dataprep.transformation.api.action.DataSetRowAction;
import org.talend.dataprep.transformation.api.action.context.TransformationContext;

/**
 * Test class for Split action. Creates one consumer, and test it.
 *
 * @see Split
 */
public class ComputeLengthTest {

    /**
     * The row consumer to test.
     */
    private DataSetRowAction rowClosure;

    /**
     * The action to test.
     */
    private ComputeLength action;

    /**
     * Constructor.
     */
    public ComputeLengthTest() throws IOException {
        action = new ComputeLength();
        Map<String, String> parameters = ActionMetadataTestUtils.parseParameters( //
                action, //
                ComputeLengthTest.class.getResourceAsStream("computeLengthAction.json"));
        final Action action = this.action.create(parameters);
        rowClosure = action.getRowAction();
    }

    @Test
    public void testAdapt() throws Exception {
        assertThat(action.adapt(null), is(action));
        ColumnMetadata column = column().name("myColumn").id(0).type(Type.STRING).build();
        assertThat(action.adapt(column), is(action));
    }

    /**
     * @see Split#create(Map)
     */
    @Test
    public void should_compute_length() {
        Map<String, String> values = new HashMap<>();
        values.put("0000", "lorem bacon");
        values.put("0001", "Bacon");
        values.put("0002", "01/01/2015");
        DataSetRow row = new DataSetRow(values);

        Map<String, String> expectedValues = new HashMap<>();
        expectedValues.put("0000", "lorem bacon");
        expectedValues.put("0001", "Bacon");
        expectedValues.put("0003", "5");
        expectedValues.put("0002", "01/01/2015");

        row = rowClosure.apply(row, new TransformationContext());
        assertEquals(expectedValues, row.values());
    }

    /**
     * @see Split#create(Map)
     */
    @Test
    public void should_compute_length_empty() {
        Map<String, String> values = new HashMap<>();
        values.put("0000", "lorem bacon");
        values.put("0001", "");
        values.put("0002", "01/01/2015");
        DataSetRow row = new DataSetRow(values);

        Map<String, String> expectedValues = new HashMap<>();
        expectedValues.put("0000", "lorem bacon");
        expectedValues.put("0001", "");
        expectedValues.put("0003", "0");
        expectedValues.put("0002", "01/01/2015");

        row = rowClosure.apply(row, new TransformationContext());
        assertEquals(expectedValues, row.values());
    }

    /**
     * @see Split#create(Map)
     */
    @Test
    public void should_compute_length_twice() {
        Map<String, String> values = new HashMap<>();
        values.put("0000", "lorem bacon");
        values.put("0001", "Bacon");
        values.put("0002", "01/01/2015");
        DataSetRow row = new DataSetRow(values);

        Map<String, String> expectedValues = new HashMap<>();
        expectedValues.put("0000", "lorem bacon");
        expectedValues.put("0001", "Bacon");
        expectedValues.put("0004", "5");
        expectedValues.put("0003", "5");
        expectedValues.put("0002", "01/01/2015");

        row = rowClosure.apply(row, new TransformationContext());
        row = rowClosure.apply(row, new TransformationContext());
        assertEquals(expectedValues, row.values());
    }

    /**
     * @see Action#getMetadataAction()
     */
    @Test
    public void should_update_metadata() {

        List<ColumnMetadata> input = new ArrayList<>();
        input.add(createMetadata("0000", "recipe"));
        input.add(createMetadata("0001", "steps"));
        input.add(createMetadata("0002", "last update"));
        RowMetadata rowMetadata = new RowMetadata(input);

        rowClosure.apply(new DataSetRow(rowMetadata), new TransformationContext());
        List<ColumnMetadata> actual = rowMetadata.getColumns();

        List<ColumnMetadata> expected = new ArrayList<>();
        expected.add(createMetadata("0000", "recipe"));
        expected.add(createMetadata("0001", "steps"));
        expected.add(createMetadata("0003", "steps_length", Type.INTEGER));
        expected.add(createMetadata("0002", "last update"));

        assertEquals(expected, actual);
    }

    /**
     * @see Action#getMetadataAction()
     */
    @Test
    public void should_update_metadata_twice() {

        List<ColumnMetadata> input = new ArrayList<>();
        input.add(createMetadata("0000", "recipe"));
        input.add(createMetadata("0001", "steps"));
        input.add(createMetadata("0002", "last update"));
        RowMetadata rowMetadata = new RowMetadata(input);

        rowClosure.apply(new DataSetRow(rowMetadata), new TransformationContext());
        rowClosure.apply(new DataSetRow(rowMetadata), new TransformationContext());
        List<ColumnMetadata> actual = rowMetadata.getColumns();

        List<ColumnMetadata> expected = new ArrayList<>();
        expected.add(createMetadata("0000", "recipe"));
        expected.add(createMetadata("0001", "steps"));
        expected.add(createMetadata("0004", "steps_length", Type.INTEGER));
        expected.add(createMetadata("0003", "steps_length", Type.INTEGER));
        expected.add(createMetadata("0002", "last update"));

        assertEquals(expected, actual);
    }

    @Test
    public void should_accept_column() {
        assertTrue(action.accept(getColumn(Type.STRING)));
    }

    @Test
    public void should_not_accept_column() {
        assertFalse(action.accept(getColumn(Type.NUMERIC)));
        assertFalse(action.accept(getColumn(Type.FLOAT)));
        assertFalse(action.accept(getColumn(Type.DATE)));
        assertFalse(action.accept(getColumn(Type.BOOLEAN)));
    }

    private ColumnMetadata createMetadata(String id, String name) {
        return createMetadata(id, name, Type.STRING);
    }

    private ColumnMetadata createMetadata(String id, String name, Type type) {
        return ColumnMetadata.Builder.column().computedId(id).name(name).type(type).headerSize(12).empty(0).invalid(2)
                .valid(5).build();
    }

}