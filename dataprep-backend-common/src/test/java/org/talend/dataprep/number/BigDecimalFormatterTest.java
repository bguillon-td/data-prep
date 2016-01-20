package org.talend.dataprep.number;

import org.junit.Test;

import java.math.BigDecimal;

import static org.junit.Assert.*;

/**
 * Created by stef on 19/01/16.
 */
public class BigDecimalFormatterTest {

    @Test
    public void testToBigDecimal_US() throws Exception {
        assertEquals("12.5", BigDecimalFormatter.format(new BigDecimal(12.50), BigDecimalParser.US_DECIMAL_PATTERN));
        assertEquals("12", BigDecimalFormatter.format(new BigDecimal(12), BigDecimalParser.US_DECIMAL_PATTERN));
        assertEquals("12.58", BigDecimalFormatter.format(new BigDecimal(12.57708), BigDecimalParser.US_DECIMAL_PATTERN));
    }

    @Test
    public void testToBigDecimal_US_grouping() throws Exception {
        assertEquals("4,512.5", BigDecimalFormatter.format(new BigDecimal(4512.50), BigDecimalParser.US_DECIMAL_PATTERN));
    }

    @Test
    public void testToBigDecimal_US_negative() throws Exception {
        assertEquals("-12.5", BigDecimalFormatter.format(new BigDecimal(-12.5), BigDecimalParser.US_DECIMAL_PATTERN));
    }

    @Test
    public void testToBigDecimal_EU() throws Exception {
        assertEquals("12,5", BigDecimalFormatter.format(new BigDecimal(12.50), BigDecimalParser.EU_DECIMAL_PATTERN));
        assertEquals("12", BigDecimalFormatter.format(new BigDecimal(12), BigDecimalParser.EU_DECIMAL_PATTERN));
        assertEquals("12,58", BigDecimalFormatter.format(new BigDecimal(12.57708), BigDecimalParser.EU_DECIMAL_PATTERN));
    }

    @Test
    public void testToBigDecimal_EU_grouping() throws Exception {
        assertEquals("4" + ((char) 160) + "512,5", BigDecimalFormatter.format(new BigDecimal(4512.50), BigDecimalParser.EU_DECIMAL_PATTERN));
    }

    @Test
    public void testToBigDecimal_EU_negative() throws Exception {
        assertEquals("-12,5", BigDecimalFormatter.format(new BigDecimal(-12.5), BigDecimalParser.EU_DECIMAL_PATTERN));
    }

    @Test
    public void testToBigDecimal_scientific() throws Exception {
        assertEquals("1.216E3", BigDecimalFormatter.format(new BigDecimal(1215.50), BigDecimalParser.SCIENTIFIC_DECIMAL_PATTERN));
    }

}
