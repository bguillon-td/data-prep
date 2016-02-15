package org.talend.dataprep.transformation.pipeline.model;

import org.talend.dataprep.api.dataset.DataSetRow;

public interface Node {

    void receive(DataSetRow row);

    void accept(Visitor visitor);

    void setLink(Link link);

    void signal(Signal signal);
}
