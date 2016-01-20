package org.talend.dataprep.number;

import java.math.BigDecimal;
import java.text.DecimalFormat;
import java.text.DecimalFormatSymbols;
import java.text.ParseException;
import java.util.Locale;

/**
 * Main goal of this class is to provide BigDecimal instance from a String.
 */
public class BigDecimalParser {

    public static DecimalFormat US_DECIMAL_PATTERN = new DecimalFormat("#,##0.##");

    public static DecimalFormat US_DECIMAL_PATTERN_ALT = new DecimalFormat("#,##0.##;(#)");

    public static DecimalFormat EU_DECIMAL_PATTERN = new DecimalFormat("#,##0.##",
            DecimalFormatSymbols.getInstance(Locale.FRENCH));

    public static DecimalFormat SCIENTIFIC_DECIMAL_PATTERN = new DecimalFormat("0.###E0");

    private BigDecimalParser() {
    }

    /**
     * Parse the given sting to a BigDecimal with default BigDecimal(String) constructor.
     *
     * This is usefull when the number is standard US format (decimal separator='.' and grouping separator in {'', ',',
     * ' '}) and for scientific notation.
     *
     * @param from string to convert to BigDecimal
     * @return an instance of BigDecimal
     * @throws ParseException if 'from' is not parseable as a number
     */
    public static BigDecimal toBigDecimal(String from) throws ParseException {
        from = from.replaceAll(" ", "");
        try {
            return new BigDecimal(from);
        } catch (NumberFormatException e) {
            for (DecimalFormat format : new DecimalFormat[] { US_DECIMAL_PATTERN, US_DECIMAL_PATTERN_ALT }) {
                try {
                    return toBigDecimal(format.parse(from));
                } catch (ParseException e1) {
                    // nothing to do, just test next format
                }
            }
            throw new ParseException(from + " is not parseable as a number", 0);
        }
    }

    /**
     * Parse the given sting to a BigDecimal with decimal separator explicitly defined.
     *
     * Usefull only when decimal separator is different than '.' or grouping separator is different than {'', ',' }.
     *
     * @param from string to convert to BigDecimal
     * @param decimalSeparator the character used for decimal sign
     * @param groupingSeparator the grouping separator
     * @return an instance of BigDecimal
     * @throws ParseException if 'from' is not parseable as a number with the given separators
     */
    public static BigDecimal toBigDecimal(String from, char decimalSeparator, char groupingSeparator) throws ParseException {
        // Remove grouping separators:
        from = from.replaceAll("[" + groupingSeparator + "]", "");

        // Replace decimal separator:
        from = from.replaceAll("[" + decimalSeparator + "]", ".");

        return toBigDecimal(from);
    }

    /**
     * Basic implemtation to get a BigDecimal instance from a Number instance WITHOUT precision lost.
     */
    private static BigDecimal toBigDecimal(Number number) {
        return new BigDecimal(number.toString());
    }

}
