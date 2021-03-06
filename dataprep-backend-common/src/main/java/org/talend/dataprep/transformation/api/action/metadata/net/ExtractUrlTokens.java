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

package org.talend.dataprep.transformation.api.action.metadata.net;

import static org.talend.dataprep.api.dataset.ColumnMetadata.Builder.column;
import static org.talend.dataprep.api.type.Type.STRING;

import java.net.URI;
import java.net.URISyntaxException;

import org.apache.commons.lang.StringUtils;
import org.springframework.stereotype.Component;
import org.talend.dataprep.api.dataset.ColumnMetadata;
import org.talend.dataprep.api.dataset.DataSetRow;
import org.talend.dataprep.api.dataset.RowMetadata;
import org.talend.dataprep.api.type.Type;
import org.talend.dataprep.transformation.api.action.context.ActionContext;
import org.talend.dataprep.transformation.api.action.metadata.category.ActionCategory;
import org.talend.dataprep.transformation.api.action.metadata.common.ActionMetadata;
import org.talend.dataprep.transformation.api.action.metadata.common.ColumnAction;

/**
 * Split a cell value on a separator.
 */
@Component(ExtractUrlTokens.ACTION_BEAN_PREFIX + ExtractUrlTokens.EXTRACT_URL_TOKENS_ACTION_NAME)
public class ExtractUrlTokens extends ActionMetadata implements ColumnAction {

    /**
     * The action name.
     */
    public static final String EXTRACT_URL_TOKENS_ACTION_NAME = "extract_url_tokens"; //$NON-NLS-1$

    /**
     * Private constructor to ensure IoC use.
     */
    protected ExtractUrlTokens() {
    }

    /**
     * @see ActionMetadata#getName()
     */
    @Override
    public String getName() {
        return EXTRACT_URL_TOKENS_ACTION_NAME;
    }

    /**
     * @see ActionMetadata#getCategory()
     */
    @Override
    public String getCategory() {
        return ActionCategory.SPLIT.getDisplayName();
    }

    /**
     * @see ActionMetadata#acceptColumn(ColumnMetadata)
     */
    @Override
    public boolean acceptColumn(ColumnMetadata column) {
        return STRING.equals(Type.get(column.getType())) && StringUtils.equalsIgnoreCase("url", column.getDomain());
    }

    /**
     * @see ColumnAction#applyOnColumn(DataSetRow, ActionContext)
     */
    @Override
    public void applyOnColumn(DataSetRow row, ActionContext context) {
        final String columnId = context.getColumnId();
        final String originalValue = row.get(columnId);
        final RowMetadata rowMetadata = row.getRowMetadata();
        final ColumnMetadata column = rowMetadata.getById(columnId);

        URI url = null;
        try {
            url = new URI(originalValue);
        } catch (URISyntaxException | NullPointerException e) {
            // Nothing to do, silently skip this row, leave url null, will be treated just below
        }
        // if url is null, we still loop on urlTokenExtractors in order to create the column metadata for all rows, even
        // invalid ones.
        String lastId = column.getId();
        for (UrlTokenExtractor urlTokenExtractor : UrlTokenExtractors.urlTokenExtractors) {
            final String columnName = column.getName() + urlTokenExtractor.getTokenName();
            String columnToInsertAfter = lastId;
            final String id = context.column(
                    columnName,
                    (r) -> {
                        final ColumnMetadata newColumn = column().name(columnName).type(urlTokenExtractor.getType()).build();
                        rowMetadata.insertAfter(columnToInsertAfter, newColumn);
                        return newColumn;
                    }
            );
            final String tokenValue = (url == null ? StringUtils.EMPTY : urlTokenExtractor.extractToken(url));
            row.set(id, (tokenValue == null ? StringUtils.EMPTY : tokenValue));
            lastId = id;
        }
    }

}
