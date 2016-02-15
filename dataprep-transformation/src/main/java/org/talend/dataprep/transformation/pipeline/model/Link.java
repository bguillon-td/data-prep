package org.talend.dataprep.transformation.pipeline.model;

import org.talend.dataprep.api.dataset.DataSetRow;

public interface Link {

    void emit(DataSetRow row);

    void accept(Visitor visitor);

    void signal(Signal signal);
}


