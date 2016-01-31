'use strict';

var gulp = require('gulp');
var $ = require('gulp-load-plugins')();
var karma = require('karma');
var wiredep = require('wiredep');
var runSequence = require('run-sequence');
var path = require('path');


var knownOptions = {
    string: 'folder'
};

var options = require('minimist')(process.argv.slice(2), knownOptions);

var fullTestsFiles = [
    'src/*.js',
    'src/{services,components}/**/*-module.js',
    'src/{services,components,mocks}/**/*.js',
    'src/components/**/*.html'
];

var pathSrcHtml = ['src/**/*.html'];

var filesToExclude = {
    services: [
        'src/components/**/*.spec.js'
    ],
    components: [
        'src/services/**/*.spec.js',
        'src/components/widgets/**/*.spec.js'
    ],
    widgets: [
        'src/services/**/*.spec.js',
        'src/components/!(widgets)/**/*.spec.js'
    ]
};


var filesToCover = {
    services: 'src/services/**/!(*spec|*mock).js',
    components: 'src/components/!(widgets)/**/!(*spec|*mock).js',
    widgets: 'src/components/widgets/**/!(*spec|*mock).js'
};

function runTests(singleRun, done, karmaConfPath, type, args) {
    var bowerDeps = wiredep({
        directory: 'bower_components',
        dependencies: true,
        devDependencies: true
    });

    var reporters = ['progress', 'coverage'];
    var preprocessors = {};

    pathSrcHtml.forEach(function (path) {
        preprocessors[path] = ['ng-html2js'];
    });
    var srcJs, localConfig;

    if(type === 'folder') {
        srcJs = 'src/**/' + args + '/!(*spec|*mock).js';
        preprocessors[srcJs] = ['coverage'];

        localConfig = {
            configFile: path.join(__dirname, '/../', karmaConfPath),
            singleRun: singleRun,
            autoWatch: !singleRun,
            reporters: reporters,
            preprocessors: preprocessors,
            files: bowerDeps.js.concat(fullTestsFiles),
            exclude: ['src/**/!(' + args + ')/*.spec.js']
        };

    } else {
        srcJs = type ? filesToCover [type] : 'src/**/!(*spec|*mock).js';
        preprocessors[srcJs] = ['coverage'];

        localConfig = {
            configFile: path.join(__dirname, '/../', karmaConfPath),
            singleRun: singleRun,
            autoWatch: !singleRun,
            reporters: reporters,
            preprocessors: preprocessors,
            files: bowerDeps.js.concat(fullTestsFiles),
            exclude: type ? filesToExclude[type] : []
        };
    }


    var server = new karma.Server(localConfig, function (failCount) {
        done(failCount ? new Error("Failed " + failCount + " tests.") : null);
    });
    server.start();
}

gulp.task('test:unit',function (done) {
    if(options.folder){
        return runTests(true /* singleRun */, done, 'karma.conf.js', 'folder', options.folder);
    }
    return runTests(true /* singleRun */, done, 'karma.conf.js');
});

gulp.task('test:components', function (done) {
    return runTests(true /* singleRun */, done, 'karma.conf.js', 'components')
});

gulp.task('test:services', function (done) {
    return runTests(true /* singleRun */, done, 'karma.conf.js', 'services')
});

gulp.task('test:widgets', function (done) {
    return runTests(true /* singleRun */, done, 'karma.conf.js', 'widgets')
});

gulp.task('test:parts', function(done) {
    return runSequence('test:services', 'test:components', 'test:widgets', done);
});

gulp.task('test', function (done) {
    runTests(true /* singleRun */, done, 'karma.conf.js')
});

gulp.task('test:auto', function (done) {
    runTests(false /* singleRun */, done, 'karma.conf.js')
});

gulp.task('test:ci', function (done) {
    runTests(true /* singleRun */, done, 'karma.conf.ci.js')
});
