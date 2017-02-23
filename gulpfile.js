'use strict';

const
    _ = require('lodash'),
    fs = require('fs'),
    path = require('path'),
    gulp = require('gulp'),
    sourcemaps = require('gulp-sourcemaps'),
    fork = require('child_process').fork,
    spawn = require('child_process').spawn,
    runSequence = require('run-sequence'),
    ts = require('gulp-typescript'),
    debug = require('debug')('TradeJS:Gulp'),
    es = require("event-stream"),
    argv = require('minimist')(process.argv.slice(2)),
    webpack = require('webpack-stream'),

    // TODO: Should not be necessary
    kill = require('tree-kill'),

    PATH_APP_INIT_FILE = 'dist/server/app',

    paths = {
        server: {
            in: path.join(__dirname, 'src', 'server'),
            out: path.join(__dirname, 'dist', 'server')
        },
        shared: {
            in: path.join(__dirname, 'src', 'shared'),
            out: path.join(__dirname, 'dist', 'shared')
        },
        client: {
            in: path.join(__dirname, 'src', 'client'),
            out: path.join(__dirname, 'dist', 'client')
        },
        custom: {
            in: path.join(__dirname, 'custom'),
            out: path.join(__dirname, '_builds')
        }
    };

let child = null;

/***************************************************************
 *
 * SERVER SERVER SERVER SERVER SERVER SERVER SERVER
 *
 **************************************************************/
gulp.task('server:dev', callback => runSequence(['copy-shared-assets', 'server:build'],  'custom:watch', 'server:run', 'server:watch', callback));
gulp.task('server:run', startChildProcess);
gulp.task('server:kill', killChildProcess);
gulp.task('server:watch', () => {
    gulp.watch(['./src/server/**/*.ts'], () => runSequence('server:kill', 'server:build', 'custom:build', 'server:run'));
});

gulp.task('server:build', () => {

    let pipes = ['server', 'shared'].map(dir => {

        let tsProject = ts.createProject(`./src/${dir}/tsconfig.json`),
            tsResult = tsProject.src()
                .pipe(sourcemaps.init())
                .pipe(tsProject());

        return tsResult.js
            .pipe(sourcemaps.write('./'))
            .pipe(gulp.dest(`./dist/${dir}`))
    });

    return es.merge(pipes);
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
    gulp.src(['./src/shared/**/*.json', '!**/tsconfig.json'])
        .pipe(gulp.dest('./dist/shared'));
});

/***************************************************************
 *
 * CLIENT CLIENT CLIENT CLIENT CLIENT CLIENT CLIENT
 *
 **************************************************************/

gulp.task('client:build', (callback) => {
    const
        outputPath = path.join(__dirname, 'dist', 'client'),
        buildNode = spawn('./node_modules/.bin/ng', ['build', '--prod', `--output-path=${outputPath}`], {
            stdio: ['pipe', process.stdout, process.stderr, 'ipc'],
            cwd: './src/client'
        });

    buildNode.on('exit', () => {
        callback();
    })
});

gulp.task('copy-client-assets', () => {
    gulp.src(['./src/client/**/*.html', '!**/index.html'])
        .pipe(gulp.dest('./dist/client'));
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
    const watcher = gulp.watch('custom/**/*');

    watcher.on('change', event => {
        buildCustom(event.path);
    });

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


/***************************************************************
 *
 * BUILD BUILD BUILD BUILD BUILD BUILD
 *
 **************************************************************/
function buildCustom(rootPath, callback = () => {}) {

    let inputPath = rootPath ? _getInputAbsoluteRootFolder(rootPath) : path.join(__dirname, 'custom'),
        outputPath = rootPath ? _getOutputAbsoluteRootFolder(rootPath) : path.join(__dirname, '_builds');

    console.log('outputPath', 'outputPath', 'outputPath', 'outputPath', 'outputPath', outputPath);

    let tsProject = ts.createProject(`./custom/tsconfig.json`),
        tsResult = gulp.src(`${inputPath}/**/*.ts`)
            .pipe(sourcemaps.init()) // This means sourcemaps will be generated
            .pipe(tsProject());

    return tsResult.js
        .pipe(sourcemaps.write()) // Now the sourcemaps are added to the .js file
        .pipe(gulp.dest(outputPath))
        .on('end', callback);
}

/***************************************************************
 *
 * FORK FORK FORK FORK FORK FORK FORK
 *
 **************************************************************/
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

/***************************************************************
 *
 * UTIL UTIL UTIL UTIL UTIL UTIL UTIL
 *
 **************************************************************/

// TODO: Bit of a hacky way to get root folder
function _getFileRelativeRootFolder(filePath) {
    return filePath.replace(__dirname, '').split('/')[2];
}

function _getInputAbsoluteRootFolder(filePath) {
    return path.join(__dirname, 'custom', _getFileRelativeRootFolder(filePath));
}

function _getOutputAbsoluteRootFolder(filePath) {
    return path.join(__dirname, '_builds', _getFileRelativeRootFolder(filePath));
}