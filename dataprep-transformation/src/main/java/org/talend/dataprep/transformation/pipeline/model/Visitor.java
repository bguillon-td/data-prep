package org.talend.dataprep.transformation.pipeline.model;

public interface Visitor {

    void visitAction(ActionNode actionNode);

    void visitCompile(CompileNode compileNode);

    void visitInlineAnalysis(InlineAnalysisNode inlineAnalysisNode);

    void visitSource(SourceNode sourceNode);

    void visitBasicLink(BasicLink basicLink);

    void visitMonitorLink(MonitorLink monitorLink);

    void visitWriterLink(WriterLink writerLink);

    void visitDelayedAnalysis(DelayedAnalysisNode delayedAnalysisNode);

}
