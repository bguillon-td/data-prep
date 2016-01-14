package org.talend.dataprep.schema.csv;

import static org.junit.Assert.assertEquals;

import org.junit.Test;

import java.util.Arrays;

/**
 * Unit test for Separator analyzer.
 */
public class SeparatorAnalyzerTest {

    @Test(expected = IllegalArgumentException.class)
    public void shouldCheckLineNumber() throws Exception {
        new SeparatorAnalyzer(-1, null);
    }

    @Test
    public void shouldSetDefaultScore() {
        SeparatorAnalyzer analyzer = new SeparatorAnalyzer(100, Arrays.asList("first", "last"));
        Separator sep = new Separator('|');
        analyzer.accept(sep);
        assertEquals(Double.MAX_VALUE, sep.getScore(), 0.000000001);
    }

    private void incrementCount(int count, int lineNumber, Separator separator) {
        for (int i = 0; i < count; i++) {
            separator.incrementCount(lineNumber);
        }
    }

}