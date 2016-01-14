package org.talend.dataprep.dataset.service.analysis;

import org.apache.commons.lang.StringUtils;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;
import org.talend.dataprep.api.dataset.DataSetContent;
import org.talend.dataprep.api.dataset.DataSetMetadata;
import org.talend.dataprep.dataset.store.metadata.DataSetMetadataRepository;
import org.talend.dataprep.lock.DistributedLock;
import org.talend.dataprep.schema.csv.CSVFormatGuess;

import java.util.Map;

/**
 * This analyzer means to index the content for search.
 * It is not used right now, that is why it does not do much.
 */
@Component
public class ContentAnalysis implements SynchronousDataSetAnalyzer {

    private static final Logger LOG = LoggerFactory.getLogger(ContentAnalysis.class);

    @Autowired
    DataSetMetadataRepository repository;

    @Override
    public void analyze(String dataSetId) {
        if (StringUtils.isEmpty(dataSetId)) {
            throw new IllegalArgumentException("Data set id cannot be null or empty.");
        }
        DistributedLock datasetLock = repository.createDatasetMetadataLock(dataSetId);
        datasetLock.lock();
        try {
            DataSetMetadata metadata = repository.get(dataSetId);
            if (metadata != null) {
                LOG.info("Indexing content of data set #{}...", dataSetId);
                DataSetContent datasetContent = metadata.getContent();
                // parameters
                final Map<String, String> parameters = metadata.getContent().getParameters();
                int headerNBLines = 1;
                try {
                    headerNBLines = Integer.parseInt(parameters.get(CSVFormatGuess.HEADER_NB_LINES_PARAMETER));
                }
                catch (NumberFormatException e){
                    LOG.info("Header nb lines not found in dataset parameters.", dataSetId);
                }

                datasetContent.setNbLinesInHeader(headerNBLines);
                datasetContent.setNbLinesInFooter(0);
                metadata.getLifecycle().contentIndexed(true);
                LOG.info("Indexed content of data set #{}.", dataSetId);
                repository.add(metadata);
            } else {
                LOG.info("Data set #{} no longer exists.", dataSetId); //$NON-NLS-1$
            }
        } finally {
            datasetLock.unlock();
        }
    }

    @Override
    public int order() {
        return 2;
    }
}
