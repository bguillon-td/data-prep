package org.talend.dataprep.transformation.pipeline;

import static org.talend.dataprep.transformation.pipeline.model.MonitorLink.monitorLink;

import java.io.IOException;
import java.util.*;
import java.util.function.Function;
import java.util.function.Predicate;
import java.util.stream.Collectors;
import java.util.stream.Stream;

import org.talend.dataprep.api.dataset.ColumnMetadata;
import org.talend.dataprep.api.dataset.DataSet;
import org.talend.dataprep.api.dataset.DataSetRow;
import org.talend.dataprep.api.dataset.RowMetadata;
import org.talend.dataprep.api.preparation.Action;
import org.talend.dataprep.transformation.api.action.context.TransformationContext;
import org.talend.dataprep.transformation.api.action.metadata.common.ActionMetadata;
import org.talend.dataprep.transformation.api.action.metadata.common.ImplicitParameters;
import org.talend.dataprep.transformation.api.transformer.TransformerWriter;
import org.talend.dataprep.transformation.api.transformer.json.NullAnalyzer;
import org.talend.dataprep.transformation.pipeline.model.*;
import org.talend.datascience.common.inference.Analyzer;
import org.talend.datascience.common.inference.Analyzers;

public class Pipeline {

    private final Node node;

    /**
     * @param node The source node (the node in the pipeline that submit content to the pipeline).
     * @see Builder to create a new instance of this class.
     */
    private Pipeline(Node node) {
        this.node = node;
    }

    public void execute(DataSet dataSet) {
        try (Stream<DataSetRow> records = dataSet.getRecords()) {
            records.forEach(node::receive);
            node.signal(Signal.END_OF_STREAM);
        }
    }

    @Override
    public String toString() {
        final StringBuilder builder = new StringBuilder();
        node.accept(new PipelineConsoleDump(builder));
        return "Pipeline {\n\n" + builder.toString() + "\n}";
    }

    public static class Builder {

        private final List<Action> actions = new ArrayList<>();
        private final Map<Action, ActionMetadata> actionToMetadata = new HashMap<>();
        private Function<List<ColumnMetadata>, Analyzer<Analyzers.Result>> inlineAnalyzer = l -> Analyzers
                .with(new NullAnalyzer());
        private Function<List<ColumnMetadata>, Analyzer<Analyzers.Result>> delayedAnalyzer = l -> Analyzers
                .with(new NullAnalyzer());
        private TransformerWriter writer = new NullWriter();
        private RowMetadata rowMetadata;
        private ActionRegistry actionRegistry;
        private Predicate<ColumnMetadata> filter = c -> true;

        public static Builder builder() {
            return new Builder();
        }

        private Node buildApplyActions(Node node, Function<Action, Node> nodeFunction) {
            final Iterator<Action> compileIterator = actions.iterator();
            Node lastNode = node;
            while (compileIterator.hasNext()) {
                final Action action = compileIterator.next();
                // Check if action needs for up-to-date statistics
                if (actionToMetadata.get(action).getBehavior().contains(ActionMetadata.Behavior.NEED_STATISTICS)) {
                    Node newNode = new InlineAnalysisNode(inlineAnalyzer, filter);
                    Link link = new BasicLink(newNode);
                    lastNode.setLink(link);
                    lastNode = newNode;
                }
                // Adds new action
                Node newNode = nodeFunction.apply(action);
                Link link = new BasicLink(newNode);
                lastNode.setLink(link);
                lastNode = newNode;
            }
            return lastNode;
        }

        private Node buildCompileActions(Node node, Function<Action, Node> nodeFunction) {
            final Iterator<Action> compileIterator = actions.iterator();
            Node lastNode = node;
            while (compileIterator.hasNext()) {
                final Action action = compileIterator.next();
                Node newNode = nodeFunction.apply(action);
                Link link = new BasicLink(newNode);
                lastNode.setLink(link);
                lastNode = newNode;
            }
            return lastNode;
        }

        public Builder withActionRegistry(ActionRegistry actionRegistry) {
            this.actionRegistry = actionRegistry;
            return this;
        }

        public Builder withInitialMetadata(RowMetadata rowMetadata) {
            this.rowMetadata = rowMetadata;
            return this;
        }

        public Builder withActions(List<Action> actions) {
            this.actions.addAll(actions);
            return this;
        }

        public Builder withInlineAnalysis(Function<List<ColumnMetadata>, Analyzer<Analyzers.Result>> analyzer) {
            this.inlineAnalyzer = analyzer;
            return this;
        }

        public Builder withDelayedAnalysis(Function<List<ColumnMetadata>, Analyzer<Analyzers.Result>> analyzer) {
            this.delayedAnalyzer = analyzer;
            return this;
        }

        public Builder withWriter(TransformerWriter writer) {
            this.writer = writer;
            return this;
        }

        public Pipeline build() {
            TransformationContext context = new TransformationContext();
            // Source
            final SourceNode sourceNode = new SourceNode();
            // Compile actions
            for (Action action : actions) {
                final ActionMetadata actionMetadata = actionRegistry.get(action.getName());
                actionToMetadata.put(action, actionMetadata);
            }
            // Analyze what columns to look at during analysis
            final Set<String> readOnlyColumns = rowMetadata.getColumns().stream().map(ColumnMetadata::getId)
                    .collect(Collectors.toSet());
            final Set<String> modifiedColumns = new HashSet<>();
            int createColumnActions = 0;
            for (Map.Entry<Action, ActionMetadata> entry : actionToMetadata.entrySet()) {
                final ActionMetadata actionMetadata = entry.getValue();
                final Action action = entry.getKey();
                Set<ActionMetadata.Behavior> behavior = actionMetadata.getBehavior();
                for (ActionMetadata.Behavior currentBehavior : behavior) {
                    switch (currentBehavior) {
                    case VALUES_ALL:
                        // All values are going to be changed, and all original columns are goign to be modified.
                        readOnlyColumns.clear();
                        break;
                    case METADATA_CHANGE_TYPE:
                    case VALUES_COLUMN:
                        final String modifiedColumnId = action.getParameters().get(ImplicitParameters.COLUMN_ID.getKey());
                        modifiedColumns.add(modifiedColumnId);
                        break;
                    case METADATA_COPY_COLUMNS:
                        // TODO Ignore column copy from analysis (metadata did not change)
                        break;
                    case METADATA_CREATE_COLUMNS:
                        createColumnActions++;
                        break;
                    case METADATA_DELETE_COLUMNS:
                    case METADATA_CHANGE_NAME:
                        // Do nothing: no need to re-analyze where only name was changed.
                        break;
                    default:
                        break;
                    }
                }
            }
            filter = c -> modifiedColumns.contains(c.getId()) || !readOnlyColumns.contains(c.getId());
            // Compile actions
            Node current = buildCompileActions(sourceNode, a -> new CompileNode(a, context.create(a.getRowAction())));
            current = buildApplyActions(current, a -> new ActionNode(a, context.in(a.getRowAction())));
            // Analyze (delayed)
            if (!modifiedColumns.isEmpty() || createColumnActions > 0) {
                Node delayedAnalysisNode = new DelayedAnalysisNode(delayedAnalyzer, filter);
                current.setLink(new BasicLink(delayedAnalysisNode));
                current = delayedAnalysisNode;
            }
            // Output
            current.setLink(monitorLink(new WriterLink(writer)));
            // Finally build pipeline
            return new Pipeline(sourceNode);
        }

        private static class NullWriter implements TransformerWriter {

            @Override
            public void write(RowMetadata columns) throws IOException {
                // Nothing to do
            }

            @Override
            public void write(DataSetRow row) throws IOException {
                // Nothing to do
            }
        }
    }

}
