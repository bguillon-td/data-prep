package org.talend.dataprep.transformation.pipeline.model;

import java.io.File;
import java.io.FileInputStream;
import java.io.FileOutputStream;
import java.io.IOException;
import java.util.List;
import java.util.function.Function;
import java.util.function.Predicate;
import java.util.stream.Collectors;
import java.util.zip.GZIPInputStream;
import java.util.zip.GZIPOutputStream;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.talend.dataprep.api.dataset.ColumnMetadata;
import org.talend.dataprep.api.dataset.DataSet;
import org.talend.dataprep.api.dataset.DataSetRow;
import org.talend.dataprep.api.dataset.RowMetadata;
import org.talend.dataprep.api.dataset.statistics.StatisticsAdapter;
import org.talend.dataprep.exception.TDPException;
import org.talend.dataprep.exception.error.CommonErrorCodes;
import org.talend.dataprep.util.Files;
import org.talend.datascience.common.inference.Analyzer;
import org.talend.datascience.common.inference.Analyzers;

import com.fasterxml.jackson.core.JsonFactory;
import com.fasterxml.jackson.core.JsonGenerator;
import com.fasterxml.jackson.core.JsonParser;
import com.fasterxml.jackson.databind.ObjectMapper;

public class DelayedAnalysisNode extends AnalysisNode implements Monitored {

    private static final Logger LOGGER = LoggerFactory.getLogger(DelayedAnalysisNode.class);

    private final JsonGenerator generator;

    private Link link = NullLink.INSTANCE;

    private File transformationDelayed;

    private RowMetadata rowMetadata;

    private long totalTime;

    private long count;

    public DelayedAnalysisNode(Function<List<ColumnMetadata>, Analyzer<Analyzers.Result>> analyzer,
            Predicate<ColumnMetadata> filter) {
        super(analyzer, filter);
        try {
            transformationDelayed = File.createTempFile("DelayedAnalysisNode", ".zip");
            JsonFactory factory = new JsonFactory();
            generator = factory.createGenerator(new GZIPOutputStream(new FileOutputStream(transformationDelayed), true));
            generator.writeStartObject();
            generator.writeFieldName("records");
            generator.writeStartArray();
        } catch (IOException e) {
            throw new TDPException(CommonErrorCodes.UNEXPECTED_EXCEPTION, e);
        }
    }

    @Override
    public void receive(DataSetRow row) {
        final long start = System.currentTimeMillis();
        try {
            final List<ColumnMetadata> columns = row.getRowMetadata().getColumns();
            try {
                generator.writeStartObject();
                rowMetadata = row.getRowMetadata();
                columns.stream().filter(filter).forEach(column -> {
                    try {
                        generator.writeStringField(column.getId(), row.get(column.getId()));
                    } catch (IOException e) {
                        LOGGER.debug("Unable to keep values for delayed analysis.", e);
                    }
                });
                generator.writeEndObject();
            } catch (IOException e) {
                LOGGER.debug("Unable to keep values for delayed analysis.", e);
            }
        } finally {
            totalTime += System.currentTimeMillis() - start;
            count++;
        }

        link.emit(row);
    }

    @Override
    public void accept(Visitor visitor) {
        visitor.visitDelayedAnalysis(this);
        link.accept(visitor);
    }

    @Override
    public void setLink(Link link) {
        this.link = link;
    }

    @Override
    public void signal(Signal signal) {
        final long start = System.currentTimeMillis();
        try {
            if (signal == Signal.END_OF_STREAM) {
                // End temporary output
                generator.writeEndArray();
                generator.writeEndObject();
                generator.flush();
                // Prepare columns for analysis
                final List<ColumnMetadata> columns = rowMetadata.getColumns().stream().filter(filter)
                        .collect(Collectors.toList());
                try (final Analyzer<Analyzers.Result> delayedAnalyzer = analyzer.apply(columns)) {
                    // Process it
                    ObjectMapper mapper = new ObjectMapper();
                    try (JsonParser parser = mapper.getFactory()
                            .createParser(new GZIPInputStream(new FileInputStream(transformationDelayed)))) {
                        final DataSet dataSet = mapper.readerFor(DataSet.class).readValue(parser);
                        dataSet.getRecords().forEach(r -> delayedAnalyzer.analyze(r.order().toArray(DataSetRow.SKIP_TDP_ID)));
                    }
                    delayedAnalyzer.end();
                    StatisticsAdapter adapter = new StatisticsAdapter();
                    adapter.adapt(columns, delayedAnalyzer.getResult(), filter);
                }
            }
        } catch (Exception e) {
            LOGGER.warn("Unable to perform delayed analysis.", e);
        } finally {
            Files.deleteQuietly(transformationDelayed);
            totalTime += System.currentTimeMillis() - start;
        }
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
