package org.talend.dataprep.dataset.store.metadata;

import static org.junit.Assert.assertEquals;
import static org.talend.dataprep.api.dataset.ColumnMetadata.Builder.column;
import static org.talend.dataprep.api.dataset.DataSetMetadata.Builder.metadata;

import java.util.Arrays;
import java.util.List;
import java.util.stream.Collectors;
import java.util.stream.StreamSupport;

import org.talend.dataprep.api.dataset.DataSetMetadata;
import org.talend.dataprep.api.type.Type;

public class DataSetMetadataRepositoryTestUtils {

    public static void ensureThatOnlyCompatibleDataSetsAreReturned(DataSetMetadataRepository repository) {
        // given
        final DataSetMetadata metadata1 = metadata().id("0001") //
                .row(column().type(Type.STRING).name("first"), column().type(Type.STRING).name("last")) //
                .build();
        final DataSetMetadata metadata2 = metadata().id("0002") //
                .row(column().type(Type.STRING).name("last"), column().type(Type.STRING).name("first")) //
                .build();
        final DataSetMetadata metadata3 = metadata().id("0003") //
                .row(column().type(Type.STRING).name("first"), column().type(Type.INTEGER).name("last")) //
                .build();
        List<DataSetMetadata> metadatas = Arrays.asList(metadata1, metadata2, metadata3);
        // retrieve set of data sets which are different from metadata1 but with similar schema
        List<DataSetMetadata> expected = metadatas.stream().filter(m -> (!metadata1.equals(m) && metadata1.compatible(m)))
                .sorted((m1, m2) -> m1.getId().compareTo(m2.getId())).collect(Collectors.toList());
        // when
        metadatas.stream().forEach(m -> repository.add(m));
        Iterable<DataSetMetadata> iterable = repository.listCompatible(metadata1.getId());
        List<DataSetMetadata> actual = StreamSupport.stream(iterable.spliterator(), false)
                .sorted((m1, m2) -> m1.getId().compareTo(m2.getId())).collect(Collectors.toList());
        // then
        assertEquals(expected, actual);
    }

}