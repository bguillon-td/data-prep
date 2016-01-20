package org.talend.dataprep.number;

import org.junit.Test;

import java.math.BigDecimal;

import static org.junit.Assert.*;

/**
 * Created by stef on 19/01/16.
 */
public class BigDecimalParserTest {

    @Test
    public void testToBigDecimal_US() throws Exception {
        assertEquals(new BigDecimal("12.5"), BigDecimalParser.toBigDecimal("0012.5"));
    }

    @Test
    public void testToBigDecimal_US_precision() throws Exception {
        assertEquals(0.35, BigDecimalParser.toBigDecimal("0.35").doubleValue(), 0);
    }

    @Test
    public void testToBigDecimal_US_thousand_group() throws Exception {
        assertEquals(new BigDecimal("10012.5"), BigDecimalParser.toBigDecimal("10,012.5"));
        assertEquals(new BigDecimal("10012.5"), BigDecimalParser.toBigDecimal("10,012.5"));
        assertEquals(new BigDecimal("10012"), BigDecimalParser.toBigDecimal("10,012"));
        assertEquals(new BigDecimal("10012.5"), BigDecimalParser.toBigDecimal("10012.5"));
    }

    @Test
    public void testToBigDecimal_US_negative_1() throws Exception {
        assertEquals(new BigDecimal("-12.5"), BigDecimalParser.toBigDecimal("-12.5"));
    }

    @Test
    public void testToBigDecimal_US_negative_2() throws Exception {
        assertEquals(new BigDecimal("-12.5"), BigDecimalParser.toBigDecimal("(12.5)"));
    }

    @Test
    public void testToBigDecimal_EU() throws Exception {
        assertEquals(new BigDecimal("12.5"), BigDecimalParser.toBigDecimal("0012,5", ',', ' '));
    }

    @Test
    public void testToBigDecimal_EU_thousand_group() throws Exception {
        assertEquals(new BigDecimal("10012.5"), BigDecimalParser.toBigDecimal("10 012,5", ',', ' '));
        assertEquals(new BigDecimal("10012.5"), BigDecimalParser.toBigDecimal("10012,5", ',', ' '));
        assertEquals(new BigDecimal("10012.5"), BigDecimalParser.toBigDecimal("10.012,5", ',', '.'));
    }

    @Test
    public void testToBigDecimal_EU_negative() throws Exception {
        assertEquals(new BigDecimal("-12.5"), BigDecimalParser.toBigDecimal("-12,5", ',', ' '));
    }

    @Test
    public void testToBigDecimal_scientific() throws Exception {
        assertEquals(new BigDecimal("1230").toString(), BigDecimalParser.toBigDecimal("1.23E+3").toPlainString());
        assertEquals(new BigDecimal("1235.2").toString(), BigDecimalParser.toBigDecimal("1.2352E+3").toPlainString());
    }

}
