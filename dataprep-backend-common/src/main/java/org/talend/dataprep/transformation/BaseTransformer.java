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

package org.talend.dataprep.transformation;

import java.util.Iterator;
import java.util.List;
import java.util.stream.Stream;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.talend.dataprep.api.dataset.DataSetRow;
import org.talend.dataprep.api.dataset.RowMetadata;
import org.talend.dataprep.api.preparation.Action;
import org.talend.dataprep.stream.ExtendedStream;
import org.talend.dataprep.transformation.api.action.DataSetRowAction;
import org.talend.dataprep.transformation.api.action.context.ActionContext;
import org.talend.dataprep.transformation.api.action.context.TransformationContext;

public class BaseTransformer {

    public static final Logger LOGGER = LoggerFactory.getLogger(BaseTransformer.class);

    public static ExtendedStream<DataSetRow> baseTransform(Stream<DataSetRow> input, List<Action> allActions, TransformationContext context) {
        return ExtendedStream.extend(input) // NOSONAR
            // Perform transformations
            .mapOnce(r -> {
                // Initial compilation of actions
                DataSetRow current = r;
                final Iterator<Action> iterator = allActions.iterator();
                while (iterator.hasNext()) {
                    final DataSetRowAction action = iterator.next().getRowAction();
                    final ActionContext actionContext = context.create(action);
                    actionContext.setRowMetadata(current.getRowMetadata().clone());
                    action.compile(actionContext);
                    final ActionContext.ActionStatus actionStatus = actionContext.getActionStatus();
                    switch (actionStatus) {
                        case OK:
                            LOGGER.debug("[Compilation] Continue using action '{}' (compilation step returned {}).", action, actionStatus);
                            current = action.apply(current, actionContext);
                            break;
                        case CANCELED:
                        case DONE:
                            LOGGER.debug("[Compilation] Remove action '{}' (compilation step returned {}).", action, actionStatus);
                            iterator.remove();
                            break;
                        default:
                    }
                    actionContext.setRowMetadata(current.getRowMetadata().clone());
                }
                context.setPreviousRow(current.clone());
                return current;
            }, //
            r -> {
                // Apply compiled actions on data
                DataSetRow current = r;
                final Iterator<Action> iterator = allActions.iterator();
                RowMetadata lastInputMetadata = null;
                while (iterator.hasNext()) {
                    final DataSetRowAction action = iterator.next().getRowAction();
                    final ActionContext actionContext = context.in(action);
                    actionContext.setRowMetadata(lastInputMetadata == null ? actionContext.getRowMetadata() : lastInputMetadata);
                    current.setRowMetadata(actionContext.getRowMetadata());
                    if (actionContext.getActionStatus() != ActionContext.ActionStatus.DONE) {
                        // Only apply action if it hasn't indicated it's DONE.
                        current = action.apply(current, actionContext);
                    }
                    // Remembers last output schema for chaining actions
                    current.setRowMetadata(actionContext.getRowMetadata());
                    lastInputMetadata = actionContext.getRowMetadata();
                    // Check whether we should continue using this action or not
                    final ActionContext.ActionStatus actionStatus = actionContext.getActionStatus();
                    switch (actionStatus) {
                        case OK:
                            LOGGER.trace("[Transformation] Continue using action '{}' (compilation step returned {}).", action, actionStatus);
                            break;
                        case CANCELED:
                            LOGGER.trace("[Transformation] Remove action '{}' (compilation step returned {}).", action, actionStatus);
                            iterator.remove();
                            break;
                                default:
                    }
                }
                context.setPreviousRow(current.clone());
                return current;
            });
    }
}
