package org.talend.dataprep.transformation.api.transformer.json;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;
import org.talend.dataprep.api.dataset.DataSet;
import org.talend.dataprep.api.dataset.RowMetadata;
import org.talend.dataprep.quality.AnalyzerService;
import org.talend.dataprep.transformation.api.action.ActionParser;
import org.talend.dataprep.transformation.api.transformer.Transformer;
import org.talend.dataprep.transformation.api.transformer.TransformerWriter;
import org.talend.dataprep.transformation.api.transformer.configuration.Configuration;
import org.talend.dataprep.transformation.format.WriterRegistrationService;
import org.talend.dataprep.transformation.pipeline.ActionRegistry;
import org.talend.dataprep.transformation.pipeline.Pipeline;

@Component
public class PipelineTransformer implements Transformer {

    @Autowired
    ActionParser actionParser;

    @Autowired
    ActionRegistry actionRegistry;

    @Autowired
    AnalyzerService analyzerService;

    @Autowired
    WriterRegistrationService writerRegistrationService;

    @Override
    public void transform(DataSet input, Configuration configuration) {
        final RowMetadata rowMetadata = input.getMetadata().getRowMetadata();
        final TransformerWriter writer = writerRegistrationService.getWriter(configuration.formatId(), configuration.output(), configuration.getArguments());
        final Pipeline pipeline = Pipeline.Builder.builder()
                .withActionRegistry(actionRegistry)
                .withActions(actionParser.parse(configuration.getActions()))
                .withInitialMetadata(rowMetadata)
                .withInlineAnalysis(analyzerService::schemaAnalysis)
                .withDelayedAnalysis(analyzerService::full)
                .withWriter(writer)
                .build();
        System.out.println(pipeline);
        pipeline.execute(input);
        System.out.println(pipeline);
    }

    @Override
    public boolean accept(Configuration configuration) {
        return Configuration.class.equals(configuration.getClass()) && configuration.volume() == Configuration.Volume.SMALL;
    }
}
