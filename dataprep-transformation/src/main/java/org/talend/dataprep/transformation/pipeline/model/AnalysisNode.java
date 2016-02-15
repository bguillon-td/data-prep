package org.talend.dataprep.transformation.pipeline.model;

import java.util.List;
import java.util.function.Function;
import java.util.function.Predicate;

import org.talend.dataprep.api.dataset.ColumnMetadata;
import org.talend.datascience.common.inference.Analyzer;
import org.talend.datascience.common.inference.Analyzers;

public abstract class AnalysisNode implements Node {

    protected final Function<List<ColumnMetadata>, Analyzer<Analyzers.Result>> analyzer;

    protected final Predicate<ColumnMetadata> filter;

    public AnalysisNode(Function<List<ColumnMetadata>, Analyzer<Analyzers.Result>> analyzer, Predicate<ColumnMetadata> filter) {
        this.analyzer = analyzer;
        this.filter = filter;
    }

}
