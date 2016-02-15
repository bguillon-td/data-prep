package org.talend.dataprep.transformation.pipeline.model;

import org.talend.dataprep.api.dataset.DataSetRow;
import org.talend.dataprep.api.preparation.Action;
import org.talend.dataprep.transformation.api.action.context.ActionContext;

public class CompileNode implements Node {

    private final Action action;

    private Link link = NullLink.INSTANCE;

    private ActionContext actionContext;

    private boolean executed = false;

    public CompileNode(Action action, ActionContext actionContext) {
        this.action = action;
        this.actionContext = actionContext;
    }

    @Override
    public void receive(DataSetRow row) {
        if (!executed) {
            action.getRowAction().compile(actionContext);
            executed = true;
        }
        link.emit(row);
    }

    @Override
    public void accept(Visitor visitor) {
        visitor.visitCompile(this);
        link.accept(visitor);
    }

    @Override
    public void setLink(Link link) {
        this.link = link;
    }

    @Override
    public void signal(Signal signal) {
        link.signal(signal);
    }

    public boolean executed() {
        return executed;
    }

    public Action getAction() {
        return action;
    }
}
