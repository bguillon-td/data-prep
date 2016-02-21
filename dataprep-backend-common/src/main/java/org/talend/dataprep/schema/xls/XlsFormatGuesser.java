//  ============================================================================
//
//  Copyright (C) 2006-2016 Talend Inc. - www.talend.com
//
//  This source code is available under agreement available at
//  https://github.com/Talend/data-prep/blob/master/LICENSE
//
//  You should have received a copy of the agreement
//  along with this program; if not, write to Talend SA
//  9 rue Pages 92150 Suresnes, France
//
//  ============================================================================

package org.talend.dataprep.schema.xls;

import java.io.IOException;
import java.io.InputStream;
import java.io.PushbackInputStream;
import java.util.Collections;

import org.apache.poi.POIXMLDocument;
import org.apache.poi.poifs.filesystem.NPOIFSFileSystem;
import org.apache.poi.util.IOUtils;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;
import org.talend.dataprep.schema.FormatGuesser;
import org.talend.dataprep.schema.SchemaParser;
import org.talend.dataprep.schema.unsupported.UnsupportedFormatGuess;

@Component("formatGuesser#xls")
public class XlsFormatGuesser implements FormatGuesser {

    private static final Logger LOGGER = LoggerFactory.getLogger(XlsFormatGuesser.class);

    @Autowired
    private XlsFormatGuess xlsFormatGuess;

    /** The fallback guess if the input is not Excel compliant. */
    @Autowired
    private UnsupportedFormatGuess fallbackGuess;

    @Override
    public FormatGuesser.Result guess(SchemaParser.Request request, String encoding) {
        if (request == null || request.getContent() == null) {
            throw new IllegalArgumentException("Content cannot be null.");
        }
        try {

            InputStream inputStream = request.getContent();

            // If doesn't support mark, wrap up
            // at least won't be done twice in XlsUtils detection method
            // prevent creating PushbackInputStream twice
            if (!inputStream.markSupported()) {
                inputStream = new PushbackInputStream( inputStream, 8);
            }

             // Try to reader headers
            if (XlsUtils.isNewExcelFormat( inputStream ) || XlsUtils.isOldExcelFormat( inputStream )) {
                return new FormatGuesser.Result(xlsFormatGuess, encoding, Collections.emptyMap());
            }
        } catch (IOException e) {
            LOGGER.debug("fail to read content: " + e.getMessage(), e);
        }
        return new FormatGuesser.Result(fallbackGuess, "UTF-8", Collections.emptyMap());
    }
}
