// ============================================================================
//
// Copyright (C) 2006-2015 Talend Inc. - www.talend.com
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

import static org.talend.dataprep.api.preparation.Action.Builder.builder;

import java.util.Map;

import org.springframework.stereotype.Component;
import org.talend.dataprep.api.dataset.ColumnMetadata;
import org.talend.dataprep.api.preparation.Action;
import org.talend.dataprep.api.type.Type;
import org.talend.dataprep.transformation.api.action.metadata.ActionCategory;
import org.talend.dataprep.transformation.api.action.metadata.ActionMetadata;
import org.talend.dataprep.transformation.api.action.metadata.SingleColumnAction;

/**
 * This will compute the absolute value for numerical columns.
 */
@Component(Round.ACTION_BEAN_PREFIX + Round.ROUND_ACTION_NAME)
public class Round extends SingleColumnAction {

    /** The action name. */
    public static final String ROUND_ACTION_NAME = "round"; //$NON-NLS-1$

    /**
     * @see ActionMetadata#getName()
     */
    @Override
    public String getName() {
        return ROUND_ACTION_NAME;
    }

    /**
     * @see ActionMetadata#getCategory()
     */
    @Override
    public String getCategory() {
        return ActionCategory.MATH.getDisplayName();
    }

    /**
     * @see ActionMetadata#create(Map)
     */
    @Override
    public Action create(Map<String, String> parameters) {
        return builder().withRow((row, context) -> {
            String columnName = parameters.get(COLUMN_ID);
            String value = row.get(columnName);
            if (value == null) {
                return;
            }

            String absValueStr = null;
            try {
                double doubleValue = Double.parseDouble(value);
                long roundedValue = Math.round(doubleValue);
                absValueStr = String.format("%s", roundedValue); //$NON-NLS-1$
            } catch (NumberFormatException nfe2) {
                // Nan: nothing to do, but fail silently (no change in value)
            }

            if (absValueStr != null) {
                row.set(columnName, absValueStr);
            }
        }).build();
    }

    /**
     * @see ActionMetadata#accept(ColumnMetadata)
     */
    @Override
    public boolean accept(ColumnMetadata column) {
        Type columnType = Type.get(column.getType());
        // in order to 'clean' integer typed columns, this function needs to be allowed on any numeric types
        return Type.NUMERIC.isAssignableFrom(columnType);
    }
}
