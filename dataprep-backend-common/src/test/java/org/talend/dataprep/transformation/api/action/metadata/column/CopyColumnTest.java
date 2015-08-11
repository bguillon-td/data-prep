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
package org.talend.dataprep.transformation.api.action.metadata.column;


import static org.hamcrest.CoreMatchers.is;
import static org.junit.Assert.*;
import static org.talend.dataprep.api.dataset.ColumnMetadata.Builder.column;
import static org.talend.dataprep.transformation.api.action.metadata.ActionMetadataTestUtils.getColumn;

import java.io.IOException;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.assertj.core.api.Assertions;

import org.junit.Before;

import org.junit.Test;
import org.talend.dataprep.api.dataset.ColumnMetadata;
import org.talend.dataprep.api.dataset.DataSetRow;
import org.talend.dataprep.api.dataset.RowMetadata;
import org.talend.dataprep.api.dataset.location.SemanticDomain;
import org.talend.dataprep.api.preparation.Action;
import org.talend.dataprep.api.type.Type;
import org.talend.dataprep.transformation.api.action.DataSetRowAction;
import org.talend.dataprep.transformation.api.action.context.TransformationContext;
import org.talend.dataprep.transformation.api.action.metadata.ActionMetadataTestUtils;
import org.talend.dataprep.transformation.api.action.metadata.category.ActionCategory;
import org.talend.dataprep.transformation.api.action.metadata.text.Split;

import java.io.IOException;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import static org.hamcrest.CoreMatchers.is;
import static org.junit.Assert.*;
import static org.talend.dataprep.api.dataset.ColumnMetadata.Builder.column;
import static org.talend.dataprep.transformation.api.action.metadata.ActionMetadataTestUtils.getColumn;

/**
 * Test class for Split action. Creates one consumer, and test it.
 *
 * @see CopyColumnMetadata
 */
public class CopyColumnTest {

    /** The action to test. */
    private CopyColumnMetadata action;

    private Map<String, String> parameters;

    @Before
    public void init() throws IOException {
        action = new CopyColumnMetadata();

        parameters = ActionMetadataTestUtils.parseParameters( //
                action, //
                CopyColumnTest.class.getResourceAsStream("copyColumnAction.json"));
    }

    @Test
    public void testAdapt() throws Exception {
        assertThat(action.adapt(null), is(action));
        ColumnMetadata column = column().name("myColumn").id(0).type(Type.STRING).build();
        assertThat(action.adapt(column), is(action));
    }

    @Test
    public void testCategory() throws Exception {
        assertThat(action.getCategory(), is(ActionCategory.COLUMNS.getDisplayName()));
    }

    /**
     * @see Split#create(Map)
     */
    @Test
    public void should_split_row() {
        //given
        final Map<String, String> values = new HashMap<>();
        values.put("0000", "lorem bacon");
        values.put("0001", "Bacon ipsum dolor amet swine leberkas pork belly");
        values.put("0002", "01/01/2015");
        final DataSetRow row = new DataSetRow(values);

        final Map<String, String> expectedValues = new HashMap<>();
        expectedValues.put("0000", "lorem bacon");
        expectedValues.put("0001", "Bacon ipsum dolor amet swine leberkas pork belly");
        expectedValues.put("0003", "Bacon ipsum dolor amet swine leberkas pork belly");
        expectedValues.put("0002", "01/01/2015");

        //when
        action.applyOnColumn(row, new TransformationContext(), parameters, "0001");

        //then
        assertEquals(expectedValues, row.values());
    }

    /**
     * @see Action#getRowAction()
     */
    @Test
    public void should_update_metadata() {
        //given
        final List<ColumnMetadata> input = new ArrayList<>();
        input.add(createMetadata("0000", "recipe"));
        input.add(createMetadata("0001", "steps"));
        input.add(createMetadata("0002", "last update"));
        final RowMetadata rowMetadata = new RowMetadata(input);

        final List<ColumnMetadata> expected = new ArrayList<>();
        expected.add(createMetadata("0000", "recipe"));
        expected.add(createMetadata("0001", "steps"));
        expected.add(createMetadata("0003", "steps_copy"));
        expected.add(createMetadata("0002", "last update"));

        //when
        action.applyOnColumn(new DataSetRow(rowMetadata), new TransformationContext(), parameters, "0001");

        //then
        assertEquals(expected, rowMetadata.getColumns());
    }

    @Test
    public void should_copy_statistics() throws Exception {
        //given
        final ColumnMetadata original = createMetadata("0001", "column");
        original.setStatistics("{}");
        final List<ColumnMetadata> input = new ArrayList<>();
        input.add(original);
        final RowMetadata rowMetadata = new RowMetadata(input);

        final ColumnMetadata transformed = createMetadata("0002", "column");
        original.setStatistics("{}");
        final List<ColumnMetadata> expected = new ArrayList<>();
        expected.add(createMetadata("0001", "column"));
        expected.add(transformed);

        //when
        action.applyOnColumn(new DataSetRow(rowMetadata), new TransformationContext(), parameters, "0001");

        //then
        assertEquals(expected.get(1).getStatistics(), original.getStatistics());
    }

    @Test
    public void should_copy_semantic() throws Exception {
        List<ColumnMetadata> input = new ArrayList<>();
        final ColumnMetadata original = createMetadata("0001", "column");
        original.setStatistics( "{}" );

        SemanticDomain semanticDomain = new SemanticDomain( "mountain_goat", "Mountain goat pale pale", 1 );

        original.setDomain( "beer" );
        original.setDomainFrequency( 1 );
        original.setDomainLabel( "the best beer" );
        original.setSemanticDomains( Arrays.asList( semanticDomain ) );

        input.add( original );
        RowMetadata rowMetadata = new RowMetadata(input);

        Assertions.assertThat( rowMetadata.getColumns() ).isNotNull().isNotEmpty().hasSize( 1 );

        action.applyOnColumn( new DataSetRow( rowMetadata ),new TransformationContext(), parameters, "0001"  );

        List<ColumnMetadata> expected = rowMetadata.getColumns();

        Assertions.assertThat( expected ).isNotNull().isNotEmpty().hasSize( 2 );

        assertEquals( expected.get( 1 ).getStatistics(), original.getStatistics() );

        Assertions.assertThat(expected.get( 1 )) //
            .isEqualToComparingOnlyGivenFields( original, "domain", "domainLabel", "domainFrequency" );

        Assertions.assertThat( expected.get( 1 ).getSemanticDomains() ).isNotNull() //
            .isNotEmpty().contains( semanticDomain );
    }

    @Test
    public void should_accept_column() {
        assertTrue(action.acceptColumn(getColumn(Type.ANY)));
    }

    /**
     * @param name name of the column metadata to create.
     * @return a new column metadata
     */
    private ColumnMetadata createMetadata(String id, String name) {
        return ColumnMetadata.Builder.column().computedId(id).name(name).type(Type.STRING).headerSize(12).empty(0).invalid(2)
                .valid(5).build();
    }

}