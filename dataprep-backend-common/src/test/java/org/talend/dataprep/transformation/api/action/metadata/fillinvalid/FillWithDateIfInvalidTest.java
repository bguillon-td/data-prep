package org.talend.dataprep.transformation.api.action.metadata.fillinvalid;

import static com.google.common.collect.Sets.newHashSet;
import static java.util.Arrays.asList;
import static org.junit.Assert.*;
import static org.talend.dataprep.transformation.api.action.metadata.ActionMetadataTestUtils.getColumn;

import java.io.IOException;
import java.io.InputStream;
import java.util.HashMap;
import java.util.Map;

import org.apache.commons.io.IOUtils;
import org.junit.Test;
import org.talend.dataprep.api.dataset.ColumnMetadata;
import org.talend.dataprep.api.dataset.DataSetRow;
import org.talend.dataprep.api.dataset.RowMetadata;
import org.talend.dataprep.api.dataset.statistics.Statistics;
import org.talend.dataprep.api.type.Type;
import org.talend.dataprep.transformation.api.action.context.TransformationContext;
import org.talend.dataprep.transformation.api.action.metadata.ActionMetadataTestUtils;

import com.fasterxml.jackson.databind.ObjectMapper;

/**
 * Unit test for FillWithDateIfInvalid action.
 * 
 * @see FillWithDateIfInvalid
 */
public class FillWithDateIfInvalidTest {

    /** The action to test. */
    private FillWithDateIfInvalid action;

    /**
     * Default empty constructor.
     */
    public FillWithDateIfInvalidTest() {
        action = new FillWithDateIfInvalid();
    }

    @Test
    public void should_fill_non_valid_date() throws Exception {

        // given
        final Map<String, String> values = new HashMap<>();
        values.put("0001", "David Bowie");
        values.put("0002", "N");
        values.put("0003", "Something");

        final RowMetadata rowMetadata = new RowMetadata();
        rowMetadata
                .setColumns(
                        asList(ColumnMetadata.Builder.column() //
                                .type(Type.DATE) //
                                .computedId("0002") //
                                .invalidValues(newHashSet("N")) //
                .statistics(getStatistics(this.getClass().getResourceAsStream("fillInvalidDateAction_statistics.json")))
                                .build()));

        final DataSetRow row = new DataSetRow(values);
        row.setRowMetadata(rowMetadata);

        Map<String, String> parameters = ActionMetadataTestUtils.parseParameters(action, //
                this.getClass().getResourceAsStream("fillInvalidDateAction.json"));

        // when
        action.applyOnColumn(row, new TransformationContext(), parameters, "0002");

        // then
        assertEquals("07/09/2015 00:00:00", row.get("0002"));
    }

    @Test
    public void should_fill_non_valid_datetime() throws Exception {

        // given
        final Map<String, String> values = new HashMap<>();
        values.put("0001", "David Bowie");
        values.put("0002", "N");
        values.put("0003", "Something");

        final RowMetadata rowMetadata = new RowMetadata();
        rowMetadata
                .setColumns(asList(ColumnMetadata.Builder.column() //
                        .type(Type.DATE) //
                        .computedId("0002") //
                        .invalidValues(newHashSet("N")) //
                                .statistics(getStatistics(
                                        this.getClass().getResourceAsStream("fillInvalidDateTimeAction_statistics.json")))
                        .build()));

        final DataSetRow row = new DataSetRow(values);
        row.setRowMetadata(rowMetadata);

        Map<String, String> parameters = ActionMetadataTestUtils.parseParameters(action, //
                this.getClass().getResourceAsStream("fillInvalidDateTimeAction.json"));

        // when
        action.applyOnColumn(row, new TransformationContext(), parameters, "0002");

        // then
        assertEquals("07/09/2015 13:31:36", row.get("0002"));
    }

    @Test
    public void should_accept_column() {
        assertTrue(action.acceptColumn(getColumn(Type.DATE)));
    }

    @Test
    public void should_not_accept_column() {
        assertFalse(action.acceptColumn(getColumn(Type.NUMERIC)));
        assertFalse(action.acceptColumn(getColumn(Type.DOUBLE)));
        assertFalse(action.acceptColumn(getColumn(Type.FLOAT)));
        assertFalse(action.acceptColumn(getColumn(Type.STRING)));
        assertFalse(action.acceptColumn(getColumn(Type.BOOLEAN)));
    }

    public Statistics getStatistics(InputStream source) throws IOException {
        final String statisticsContent = IOUtils.toString(source);
        final ObjectMapper mapper = new ObjectMapper();
        return mapper.readValue(statisticsContent, Statistics.class);
    }

}