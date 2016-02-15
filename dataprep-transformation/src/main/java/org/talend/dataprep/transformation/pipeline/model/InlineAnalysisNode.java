package org.talend.dataprep.transformation.pipeline.model;

import java.util.Collections;
import java.util.List;
import java.util.function.Function;
import java.util.function.Predicate;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.talend.dataprep.api.dataset.ColumnMetadata;
import org.talend.dataprep.api.dataset.DataSetRow;
import org.talend.dataprep.api.dataset.statistics.StatisticsAdapter;
import org.talend.dataprep.transformation.api.transformer.json.NullAnalyzer;
import org.talend.datascience.common.inference.Analyzer;
import org.talend.datascience.common.inference.Analyzers;

public class InlineAnalysisNode extends AnalysisNode implements Monitored {

    private static final Logger LOGGER = LoggerFactory.getLogger(AnalysisNode.class);

    private Link link = NullLink.INSTANCE;

    private List<ColumnMetadata> previousColumns = Collections.emptyList();

    private Analyzer<Analyzers.Result> inlineAnalyzer = Analyzers.with(new NullAnalyzer());

    private long totalTime;

    private long count;

    public InlineAnalysisNode(Function<List<ColumnMetadata>, Analyzer<Analyzers.Result>> analyzer,
            Predicate<ColumnMetadata> filter) {
        super(analyzer, filter);
    }

    @Override
    public void receive(DataSetRow row) {
        // Reuse or re-init previously created analyzer
        final List<ColumnMetadata> rowColumns = row.getRowMetadata().getColumns();
        if (newAnalyzerNeeded(rowColumns)) {
            try {
                if (inlineAnalyzer != null) {
                    inlineAnalyzer.close();
                }
            } catch (Exception e) {
                LOGGER.debug("Unable to close previously initialized analyzer.", e);
            }
            inlineAnalyzer = analyzer.apply(rowColumns);
            inlineAnalyzer.init();
            System.out.println("Reinit done");
        }
        // Analyze received row
        final long start = System.currentTimeMillis();
        try {
            final DataSetRow orderedRow = row.order(rowColumns);
            final String[] array = orderedRow.toArray(DataSetRow.SKIP_TDP_ID);
            int filteredOutValues = 0;
            for (int i = 0; i < rowColumns.size(); i++) {
                if (!filter.test(rowColumns.get(i))) { // Removes non needed values from analysis
                    array[i] = null;
                    filteredOutValues++;
                }
            }
            LOGGER.trace("{}/{} value(s) filtered out during analysis (in #{})", filteredOutValues, rowColumns.size(),
                    row.getTdpId());
            inlineAnalyzer.analyze(array);
            StatisticsAdapter adapter = new StatisticsAdapter(); // TODO
            adapter.adapt(rowColumns, inlineAnalyzer.getResult(), filter);
        } finally {
            previousColumns = rowColumns;
            totalTime += System.currentTimeMillis() - start;
            count++;
        }
        link.emit(row);
    }

    private boolean newAnalyzerNeeded(List<ColumnMetadata> rowColumns) {
        if (previousColumns.size() != rowColumns.size()) {
            return true;
        }
        for (int i = 0; i < previousColumns.size(); i++) {
            final ColumnMetadata previousColumn = previousColumns.get(i);
            final ColumnMetadata rowColumn = rowColumns.get(i);
            if (!previousColumn.getType().equals(rowColumn.getType())) {
                return true;
            }
            if (!previousColumn.getDomain().equals(rowColumn.getDomain())) {
                return true;
            }
        }
        return false;
    }

    @Override
    public void accept(Visitor visitor) {
        visitor.visitInlineAnalysis(this);
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

    @Override
    public long getTotalTime() {
        return totalTime;
    }

    @Override
    public long getCount() {
        return count;
    }
}
