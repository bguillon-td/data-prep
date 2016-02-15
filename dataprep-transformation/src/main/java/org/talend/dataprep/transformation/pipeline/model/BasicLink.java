package org.talend.dataprep.transformation.pipeline.model;

import org.talend.dataprep.api.dataset.DataSetRow;

public class BasicLink implements Link {

    private final Node target;

    public BasicLink(Node target) {
        this.target = target;
    }

    @Override
    public void emit(DataSetRow row) {
        target.receive(row);
    }

    @Override
    public void accept(Visitor visitor) {
        visitor.visitBasicLink(this);
    }

    @Override
    public void signal(Signal signal) {
        target.signal(signal);
    }

    public Node getTarget() {
        return target;
    }
}
