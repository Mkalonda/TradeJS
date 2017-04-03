'use strict';

const
    fs = require('fs'),
    path = require('path'),
    gulp = require('gulp'),
    sourcemaps = require('gulp-sourcemaps'),
    fork = require('child_process').fork,
    runSequence = require('run-sequence'),
    ts = require('gulp-typescript'),
    debug = require('debug')('TradeJS:Gulp'),
    es = require("event-stream"),
    argv = require('minimist')(process.argv.slice(2)),
    tslint = require('gulp-tslint'),

    // TODO: Should not be necessary
    kill = require('tree-kill'),

    PATH_DIST = path.resolve(__dirname),
    PATH_APP_INIT_FILE = path.resolve(PATH_DIST, 'app');

let child = null;

gulp.task('tslint', () => {

    gulp.src(["./**/*.ts", '!node_modules/**/*.*'])
        .pipe(tslint({
            //configuration: "../tslint.json",
            formatter: "prose"
        }))
        .on('error', (err) => {
            console.log(err);
        })
        .pipe(tslint.report())

});

gulp.task('server:dev', callback => runSequence(
    ['copy-shared-assets', 'server:build'],
    'server:run',
	'server:watch',
	'custom:build',
    'custom:watch',
    callback
))
;
gulp.task('server:run', startChildProcess);
gulp.task('server:kill', killChildProcess);
gulp.task('server:watch', () => {
    gulp.watch(['./**/*.ts', '!./node_modules/',  '!node_modules/**/*.*'], () => runSequence('server:kill', 'server:build', 'custom:build', 'server:run'));
});

gulp.task('server:build', () => {

    // Server
    let server, shared,
        tsProject1 = ts.createProject(`./tsconfig.json`),
        tsResult1 = tsProject1.src()
            .pipe(sourcemaps.init())
            .pipe(tsProject1());

    server = tsResult1.js
        .pipe(sourcemaps.write('./'))
        .pipe(gulp.dest('./'));

    // Shared
    let tsProject2 = ts.createProject(`../shared/tsconfig.json`),
        tsResult2 = tsProject2.src()
            .pipe(sourcemaps.init())
            .pipe(tsProject2());

    shared = tsResult2.js
        .pipe(sourcemaps.write('./'))
        .pipe(gulp.dest(path.resolve(__dirname, '..', 'shared')));

    return es.merge(server, shared);
});

gulp.task('server:build:run', ['server:kill'], callback => {
    runSequence(['copy-shared-assets', 'server:build'], () => {
        buildCustom(null, () => {
            runSequence('server:run', callback);
        });
    });
});

/** NEEDED TO COPY OVER JSON FILES TO DIST FOLDER **/
gulp.task('copy-shared-assets', () => {
    gulp.src(['../shared/**/*.json', '!**/tsconfig.json'])
        .pipe(gulp.dest(path.resolve(__dirname, '../shared/dist/')));
});

/***************************************************************
 *
 * CUSTOM CUSTOM CUSTOM CUSTOM CUSTOM
 *
 **************************************************************/
gulp.task('custom:build', ['custom:copy-assets'], callback => {
    buildCustom(null, callback);
});

gulp.task('custom:watch', (callback) => {
    const watcher = gulp.watch('../custom/**/*');

    watcher.on('change', event => buildCustom(event.path));

    callback();
});

gulp.task('custom:copy-assets', (callback) => {
    let inputPath = argv['input-path'] ? _getInputAbsoluteRootFolder(argv['input-path']) : path.join(__dirname, 'custom'),
        outputPath = argv['output-path'] ? _getOutputAbsoluteRootFolder(argv['output-path']) : path.join(__dirname, '_builds');

    gulp.src([inputPath + '/**/*.json'])
        .pipe(gulp.dest(outputPath))
        .on('error', (error) => {
            console.log(error);
        })
        .on('end', callback);
});

function startChildProcess(callback) {
    child = fork(PATH_APP_INIT_FILE, [...process.argv], {
        env: process.env,
        stdio: ['pipe', process.stdout, process.stderr, 'ipc']
    });

    callback();
}


function killChildProcess() {
    return new Promise(resolve => {
        if (child && child.pid && !child.isClosing) {
            child.isClosing = true;
            child.on('exit', () => {
                child = null;
                resolve();
            });
            child.kill();
        }
        else
            resolve();
    });
}

function buildCustom(rootPath, callback = () => {
}) {

    let inputPath = rootPath ? _getInputAbsoluteRootFolder(rootPath) : path.resolve('..', 'custom'),
        outputPath = rootPath ? _getOutputAbsoluteRootFolder(rootPath) : path.resolve('..', '_builds');

    console.log('outputPath', 'outputPath', 'outputPath', 'outputPath', 'outputPath', outputPath);

    let tsProject = ts.createProject(path.resolve('../custom/tsconfig.json')),
        tsResult = gulp.src(`${inputPath}/**/*.ts`)
            .pipe(sourcemaps.init()) // This means sourcemaps will be generated
            .pipe(tsProject());

    return tsResult.js
        .pipe(sourcemaps.write()) // Now the sourcemaps are added to the .js file
        .pipe(gulp.dest(outputPath))
        .on('end', callback);
}

// TODO: Bit of a hacky way to get root folder
function _getFileRelativeRootFolder(filePath) {
    return filePath.replace(path.resolve('..'), '').split('\\')[2] || '';
}

function _getInputAbsoluteRootFolder(filePath) {
    console.log('filePath', 'filePath', filePath)
    return path.resolve('..', 'custom', _getFileRelativeRootFolder(filePath));
}

function _getOutputAbsoluteRootFolder(filePath) {
    return path.resolve('..', '_builds', _getFileRelativeRootFolder(filePath));
}