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

package org.talend.dataprep.transformation.api.action.metadata.column;

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
import org.talend.dataprep.transformation.api.action.context.ActionContext;
import org.talend.dataprep.transformation.api.action.metadata.category.ActionCategory;
import org.talend.dataprep.transformation.api.action.metadata.common.ActionMetadata;
import org.talend.dataprep.transformation.api.action.metadata.common.ColumnAction;
import org.talend.dataprep.transformation.api.action.metadata.common.OtherColumnParameters;
import org.talend.dataprep.transformation.api.action.parameters.Parameter;
import org.talend.dataprep.transformation.api.action.parameters.ParameterType;
import org.talend.dataprep.transformation.api.action.parameters.SelectParameter;

/**
 * Concat action concatenates 2 columns into a new one. The new column name will be "column_source + selected_column."
 * The new column content is "prefix + column_source + separator + selected_column + suffix"
 */
@Component(Concat.ACTION_BEAN_PREFIX + Concat.CONCAT_ACTION_NAME)
public class Concat extends ActionMetadata implements ColumnAction, OtherColumnParameters {

    /**
     * The action name.
     */
    public static final String CONCAT_ACTION_NAME = "concat"; //$NON-NLS-1$

    /**
     * The optional new column prefix content.
     */
    public static final String PREFIX_PARAMETER = "prefix"; //$NON-NLS-1$

    /**
     * The optional new column separator.
     */
    public static final String SEPARATOR_PARAMETER = "concat_separator"; //$NON-NLS-1$

    /**
     * The optional new column suffix content.
     */
    public static final String SUFFIX_PARAMETER = "suffix"; //$NON-NLS-1$

    /**
     * The separator use in the new column name.
     */
    public static final String COLUMN_NAMES_SEPARATOR = "_"; //$NON-NLS-1$

    /**
     * @see ActionMetadata#getName()
     */
    @Override
    public String getName() {
        return CONCAT_ACTION_NAME;
    }

    /**
     * @see ActionMetadata#getCategory()
     */
    @Override
    public String getCategory() {
        return ActionCategory.COLUMNS.getDisplayName();
    }

    /**
     * @see ActionMetadata#getParameters()
     */
    @Override
    public List<Parameter> getParameters() {
        final List<Parameter> parameters = super.getParameters();

        parameters.add(new Parameter(PREFIX_PARAMETER, ParameterType.STRING, StringUtils.EMPTY));

        parameters.add(SelectParameter.Builder
                .builder()
                .name(MODE_PARAMETER)
                .item(OTHER_COLUMN_MODE,
                        new Parameter(SELECTED_COLUMN_PARAMETER, ParameterType.COLUMN, StringUtils.EMPTY, false, false),
                        new Parameter(SEPARATOR_PARAMETER, ParameterType.STRING, StringUtils.EMPTY)) //
                .item(CONSTANT_MODE) //
                .defaultValue(OTHER_COLUMN_MODE) //
                .build());

        parameters.add(new Parameter(SUFFIX_PARAMETER, ParameterType.STRING, StringUtils.EMPTY));
        return parameters;
    }

    /**
     * @see ActionMetadata#acceptColumn(ColumnMetadata)
     */
    @Override
    public boolean acceptColumn(ColumnMetadata column) {
        // accept all types of columns
        return true;
    }

    @Override
    public void compile(ActionContext actionContext) {
        super.compile(actionContext);
        if (actionContext.getActionStatus() == ActionContext.ActionStatus.OK) {
            checkSelectedColumnParameter(actionContext.getParameters(), actionContext.getInputRowMetadata());
            actionContext.setActionStatus(ActionContext.ActionStatus.OK);
        }
    }

    /**
     * @see ColumnAction#applyOnColumn(DataSetRow, ActionContext)
     */
    @Override
    public void applyOnColumn(DataSetRow row, ActionContext context) {
        final RowMetadata rowMetadata = row.getRowMetadata();
        final String columnId = context.getColumnId();
        final Map<String, String> parameters = context.getParameters();
        final ColumnMetadata sourceColumn = rowMetadata.getById(columnId);


        final String newColumnName = evalNewColumnName(sourceColumn.getName(), rowMetadata, parameters);

        String concatColumn = context.column(newColumnName, (r) -> {
            final ColumnMetadata c = ColumnMetadata.Builder //
                    .column() //
                    .name(newColumnName) //
                    .type(Type.STRING) //
                    .build();
            rowMetadata.insertAfter(columnId, c);
            return c;
        });

        // Set new column value
        String sourceValue = row.get(columnId);

        String newValue = getParameter(parameters, PREFIX_PARAMETER, StringUtils.EMPTY);

        newValue += sourceValue;

        if (parameters.get(MODE_PARAMETER).equals(OTHER_COLUMN_MODE)) {
            ColumnMetadata selectedColumn = rowMetadata.getById(parameters.get(SELECTED_COLUMN_PARAMETER));
            String selectedColumnValue = row.get(selectedColumn.getId());
            newValue += getParameter(parameters, SEPARATOR_PARAMETER, StringUtils.EMPTY) + selectedColumnValue;
        }

        newValue += getParameter(parameters, SUFFIX_PARAMETER, StringUtils.EMPTY);

        row.set(concatColumn, newValue);
    }

    private String evalNewColumnName(String sourceColumnName, RowMetadata rowMetadata, Map<String, String> parameters) {
        final String prefix = getParameter(parameters, PREFIX_PARAMETER, StringUtils.EMPTY);
        final String suffix = getParameter(parameters, SUFFIX_PARAMETER, StringUtils.EMPTY);

        if (parameters.get(MODE_PARAMETER).equals(OTHER_COLUMN_MODE)) {
            ColumnMetadata selectedColumn = rowMetadata.getById(parameters.get(SELECTED_COLUMN_PARAMETER));
            return sourceColumnName + COLUMN_NAMES_SEPARATOR + selectedColumn.getName();
        } else {
            return prefix + sourceColumnName + suffix;
        }
    }
    
    /**
     * Check that the selected column parameter is correct in case we concatenate with another column: defined in the
     * parameters and there's a matching column. If the parameter is invalid, an exception is thrown.
     *
     * @param parameters where to look the parameter value.
     * @param rowMetadata the row metadata where to look for the column.
     */
    private void checkSelectedColumnParameter(Map<String, String> parameters, RowMetadata rowMetadata) {
        if (parameters.get(MODE_PARAMETER).equals(OTHER_COLUMN_MODE)
                && (!parameters.containsKey(SELECTED_COLUMN_PARAMETER) || rowMetadata.getById(
                        parameters.get(SELECTED_COLUMN_PARAMETER)) == null)) {
            throw new TDPException(CommonErrorCodes.BAD_ACTION_PARAMETER, ExceptionContext.build().put("paramName",
                    SELECTED_COLUMN_PARAMETER));
        }
    }

    /**
     * Return the parameter value or the default value if not found.
     *
     * @param parameters where to look.
     * @param parameterName the parameter name.
     * @param defaultValue the value to return if the parameter value is null or not found.
     * @return the parameter value or the default value if null or not found.
     */
    private String getParameter(Map<String, String> parameters, String parameterName, String defaultValue) {
        String value = parameters.get(parameterName);
        if (value == null) {
            value = defaultValue;
        }
        return value;
    }

}
