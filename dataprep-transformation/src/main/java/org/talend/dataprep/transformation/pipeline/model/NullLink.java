package org.talend.dataprep.transformation.pipeline.model;

import org.talend.dataprep.api.dataset.DataSetRow;

public class NullLink implements Link {

    public static final Link INSTANCE = new NullLink();

    private NullLink() {
    }

    @Override
    public void emit(DataSetRow row) {
        // Nothing to do
    }

    @Override
    public void accept(Visitor visitor) {
        // Nothing to do
    }

    @Override
    public void signal(Signal signal) {
        // Nothing to do
    }
}
