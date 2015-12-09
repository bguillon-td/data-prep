package org.talend.dataprep.transformation.api.action.metadata.column;

import static org.talend.dataprep.api.dataset.ColumnMetadata.Builder.column;
import static org.talend.dataprep.transformation.api.action.metadata.category.ActionScope.COLUMN_METADATA;

import java.util.Collections;
import java.util.List;
import java.util.Map;

import org.apache.commons.lang.StringUtils;
import org.springframework.stereotype.Component;
import org.talend.daikon.exception.ExceptionContext;
import org.talend.dataprep.api.dataset.ColumnMetadata;
import org.talend.dataprep.api.dataset.DataSetRow;
import org.talend.dataprep.api.dataset.RowMetadata;
import org.talend.dataprep.api.type.Type;
import org.talend.dataprep.exception.TDPException;
import org.talend.dataprep.exception.error.CommonErrorCodes;
import org.talend.dataprep.transformation.api.action.context.TransformationContext;
import org.talend.dataprep.transformation.api.action.metadata.category.ActionCategory;
import org.talend.dataprep.transformation.api.action.metadata.common.ActionMetadata;
import org.talend.dataprep.transformation.api.action.metadata.common.ColumnAction;
import org.talend.dataprep.transformation.api.action.parameters.Parameter;
import org.talend.dataprep.transformation.api.action.parameters.ParameterType;
import org.talend.dataprep.transformation.api.action.parameters.SelectParameter;

/**
 * duplicate a column
 */
@Component(CreateNewColumn.ACTION_BEAN_PREFIX + CreateNewColumn.ACTION_NAME)
public class CreateNewColumn extends ActionMetadata implements ColumnAction {

    /**
     * The action name.
     */
    public static final String ACTION_NAME = "create_new_column"; //$NON-NLS-1$

    /**
     * The split column appendix.
     */
    public static final String COPY_APPENDIX = "_copy"; //$NON-NLS-1$

    public static final String DEFAULT_VALUE_PARAMETER = "default_value"; //$NON-NLS-1$

    /**
     * Mode: tells if fill value is taken from another column or is a constant
     */
    public static final String MODE_PARAMETER = "mode_new_column"; //$NON-NLS-1$

    /**
     * The selected column id.
     */
    public static final String SELECTED_COLUMN_PARAMETER = "selected_column"; //$NON-NLS-1$

    /**
     * Constant to represents mode where we fill with a constant.
     */
    public static final String EMPTY_MODE = "Nothing, this column will be empty";
    public static final String CONSTANT_MODE = "A constant";
    public static final String COLUMN_MODE = "Another column";


    /**
     * @see ActionMetadata#getName()
     */
    @Override
    public String getName() {
        return ACTION_NAME;
    }

    /**
     * @see ActionMetadata#getCategory()
     */
    @Override
    public String getCategory() {
        return ActionCategory.COLUMN_METADATA.getDisplayName();
    }

    /**
     * @see ActionMetadata#acceptColumn(ColumnMetadata)
     */
    @Override
    public boolean acceptColumn(ColumnMetadata column) {
        return true;
    }


    /**
     * @see ActionMetadata#getActionScope()
     */
    @Override
    public List<String> getActionScope() {
        return Collections.singletonList(COLUMN_METADATA.getDisplayName());
    }


    public List<Parameter> getParameters() {
        final List<Parameter> parameters = super.getParameters();

        Parameter constantParameter = null;

                constantParameter=new Parameter(DEFAULT_VALUE_PARAMETER, //
                        ParameterType.STRING, //
                        StringUtils.EMPTY);

        //@formatter:off
        parameters.add(SelectParameter.Builder.builder()
                        .name(MODE_PARAMETER)
                        .item(EMPTY_MODE)
                        .item(CONSTANT_MODE, constantParameter)
                        .item(COLUMN_MODE, new Parameter(SELECTED_COLUMN_PARAMETER, ParameterType.COLUMN, StringUtils.EMPTY, false, false))
                        .defaultValue(COLUMN_MODE)
                        .build()
        );
        //@formatter:on

        return parameters;
    }

    /**
     * @see ColumnAction#applyOnColumn(DataSetRow, TransformationContext, Map, String)
     */
    @Override
    public void applyOnColumn(DataSetRow row, TransformationContext context, Map<String, String> parameters, String columnId) {
        RowMetadata rowMetadata = row.getRowMetadata();
        ColumnMetadata sourceColumn = rowMetadata.getById(columnId);

        checkParameters(parameters, row);

        final String newColumnName = evalNewColumnName(sourceColumn.getName(), rowMetadata, parameters);

        String concatColumn = context.in(this).column(newColumnName, rowMetadata, (r) -> {
            final ColumnMetadata c = ColumnMetadata.Builder //
                    .column() //
                    .name(newColumnName) //
                    .type(Type.STRING) //
                    .build();
            rowMetadata.insertAfter(columnId, c);
            return c;
        });

        String newValue = "";
        switch (parameters.get(MODE_PARAMETER)){
            case EMPTY_MODE:
                newValue = "";
                break;
            case CONSTANT_MODE:
                newValue = parameters.get(DEFAULT_VALUE_PARAMETER);
                break;
            case COLUMN_MODE:
                ColumnMetadata selectedColumn = rowMetadata.getById(parameters.get(SELECTED_COLUMN_PARAMETER));
                newValue = row.get(selectedColumn.getId());
                break;
        }

        row.set(concatColumn, newValue);
    }

    private String evalNewColumnName(String sourceColumnName, RowMetadata rowMetadata, Map<String, String> parameters) {
        if (parameters.get(MODE_PARAMETER).equals(COLUMN_MODE)) {
            ColumnMetadata selectedColumn = rowMetadata.getById(parameters.get(SELECTED_COLUMN_PARAMETER));
            return selectedColumn.getName() + CopyColumnMetadata.COPY_APPENDIX;
        } else {
            return "new column";
        }
    }

    /**
     * Check that the selected column parameter is correct in case we concatenate with another column: defined in the
     * parameters and there's a matching column. If the parameter is invalid, an exception is thrown.
     *
     * @param parameters where to look the parameter value.
     * @param row the row where to look for the column.
     */
    private void checkParameters(Map<String, String> parameters, DataSetRow row) {
        if (!parameters.containsKey(MODE_PARAMETER)) {
            throw new TDPException(CommonErrorCodes.BAD_ACTION_PARAMETER, ExceptionContext.build().put("paramName",
                    MODE_PARAMETER));
        }

        if (parameters.get(MODE_PARAMETER).equals(CONSTANT_MODE) && !parameters.containsKey(DEFAULT_VALUE_PARAMETER)) {
            throw new TDPException(CommonErrorCodes.BAD_ACTION_PARAMETER, ExceptionContext.build().put("paramName",
                    DEFAULT_VALUE_PARAMETER));
        }
        if (parameters.get(MODE_PARAMETER).equals(COLUMN_MODE) &&
                (!parameters.containsKey(SELECTED_COLUMN_PARAMETER) || row.getRowMetadata().getById(parameters.get(SELECTED_COLUMN_PARAMETER)) == null)) {
            throw new TDPException(CommonErrorCodes.BAD_ACTION_PARAMETER, ExceptionContext.build().put("paramName",
                    SELECTED_COLUMN_PARAMETER));
        }
    }

}
