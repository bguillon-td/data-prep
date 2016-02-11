package org.talend.dataprep.api.service;

import static org.springframework.web.bind.annotation.RequestMethod.GET;
import static org.springframework.web.bind.annotation.RequestMethod.POST;

import java.util.List;
import java.util.Optional;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.talend.dataprep.api.service.info.VersionService;
import org.talend.dataprep.http.HttpResponseContext;
import org.talend.dataprep.info.Version;
import org.talend.dataprep.metrics.Timed;
import org.talend.dataprep.upgrade.UpgradeLog;
import org.talend.dataprep.upgrade.UpgradeTask;
import org.talend.dataprep.upgrade.Upgrades;

import io.swagger.annotations.ApiOperation;

@RestController
public class UpgradeAPI extends APIService {

    private static final Logger LOGGER = LoggerFactory.getLogger(UpgradeAPI.class);

    @Autowired
    VersionService service;

    @Autowired
    Upgrades upgrades;

    /*
    Migration from A -> B

    Compute all migrations from version A -> B.
        -> Minimum is "set version B" in metadata
    Keep a log of modified data (old / new).
    Distinct mandatory / recommended updates ?


    Each migration task
        -> range of applicable versions ?
    */

    @RequestMapping(value = "/api/upgrade/check", method = GET)
    @ApiOperation(value = "Checks if a newer version is available and returns this new available version as JSON.", produces = MediaType.APPLICATION_JSON_VALUE)
    @Timed
    public Version check() {
        // Connect to an URL (in configuration) that serves a JSON Version object
        Version remoteVersion = new Version(); // TODO
        // Compares versions
        com.github.zafarkhaja.semver.Version parsedRemoteVersion = com.github.zafarkhaja.semver.Version.valueOf(remoteVersion.getVersionId());
        com.github.zafarkhaja.semver.Version parsedCurrentVersion = com.github.zafarkhaja.semver.Version.valueOf(service.version().getVersionId());
        if (parsedRemoteVersion.compareTo(parsedCurrentVersion) > 0) {
            // New version is available
            return remoteVersion;
        } else {
            // New version not available
            HttpResponseContext.status(HttpStatus.NO_CONTENT);
            return null;
        }
    }

    @RequestMapping(value = "/api/upgrade", method = POST)
    @ApiOperation(value = "", produces = MediaType.APPLICATION_JSON_VALUE)
    @Timed
    public UpgradeLog upgrade(Version target) {
        LOGGER.info("Initiating migration to version {}...", target.getVersionId());
        final List<UpgradeTask> migrationTasks = upgrades.getTasks(target);
        final Optional<UpgradeLog> result = migrationTasks.stream().map(c -> {
            try {
                return c.call();
            } catch (Exception e) {
                return UpgradeLog.fail;
            }
        }).reduce(UpgradeLog::merge);
        LOGGER.info("Migration to version {} done.", target.getVersionId());
        return result.get();
    }

}
