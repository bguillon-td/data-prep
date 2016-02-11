package org.talend.dataprep.upgrade;

import java.util.concurrent.Callable;

import org.talend.dataprep.info.Version;

public interface UpgradeTask extends Callable<UpgradeLog> {

    Version getVersion();

    String getDescription();

    String getName();
}
