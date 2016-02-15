package org.talend.dataprep.transformation.pipeline.model;

import org.talend.dataprep.api.dataset.DataSetRow;
import org.talend.dataprep.api.preparation.Action;
import org.talend.dataprep.transformation.api.action.context.ActionContext;

public class ActionNode implements Node, Monitored {

    private final Action action;

    private Link link = NullLink.INSTANCE;

    private ActionContext actionContext;

    private long totalTime;

    private int count;

    public ActionNode(Action action, ActionContext actionContext) {
        this.action = action;
        this.actionContext = actionContext;
    }

    @Override
    public void receive(DataSetRow row) {
        final DataSetRow actionRow;
        final long start = System.currentTimeMillis();
        try {
            switch (actionContext.getActionStatus()) {
            case NOT_EXECUTED:
            case OK:
                actionRow = action.getRowAction().apply(row, actionContext);
                break;
            case DONE:
            case CANCELED:
            default:
                actionRow = row;
                break;
            }
        } finally {
            totalTime += System.currentTimeMillis() - start;
            count++;
        }
        link.emit(actionRow);
    }

    @Override
    public void accept(Visitor visitor) {
        visitor.visitAction(this);
        if (link != null) {
            link.accept(visitor);
        }
    }

    @Override
    public void setLink(Link link) {
        this.link = link;
    }

    @Override
    public void signal(Signal signal) {
        link.signal(signal);
    }

    public Action getAction() {
        return action;
    }

    public ActionContext getActionContext() {
        return actionContext;
    }

    @Override
    public long getTotalTime() {
        return totalTime;
    }

    @Override
    public long getCount() {
        return count;
    }
}
