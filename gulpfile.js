'use strict';

const
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

    PATH_APP_INIT_FILE = 'dist/server/app';

let child = null;

/***************************************************************
 *
 * SERVER SERVER SERVER SERVER SERVER SERVER SERVER
 *
 **************************************************************/
gulp.task('server:dev', callback => runSequence('server:build:run', 'server:watch', callback));
gulp.task('server:kill', killChildProcess);
gulp.task('server:run', ['custom:watch'], startChildProcess);

gulp.task('server:build', function() {

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

gulp.task('server:build:run', ['server:kill'], () => {
    runSequence(['copy-shared-assets', 'server:build'], 'server:run');
});

gulp.task('server:watch', callback => {
    gulp.watch(['./src/server/**/*.ts', './src/shared/**/*.ts', '!./src/shared/_builds/**/*'], ['server:build:run'], callback);
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
gulp.task('custom:build', ['custom:compile', 'custom:copy-assets'], function() {
    console.log('adfsaf');
});

gulp.task('custom:watch', (callback) => {
    const watcher = gulp.watch('custom/**/*');

    watcher.on('change', function(event) {

        let inputPath = _getInputAbsoluteRootFolder(event.path),
            outputPath = _getOutputAbsoluteRootFolder(event.path);
        console.log('outputPath',  outputPath);
        console.log('outputPath', 'outputPath', 'outputPath', 'outputPath', 'outputPath', outputPath);

        let tsProject = ts.createProject(`./custom/tsconfig.json`),
            tsResult = gulp.src(`${inputPath}/**/*.ts`)
            .pipe(sourcemaps.init()) // This means sourcemaps will be generated
            .pipe(tsProject());

        return tsResult.js
            .pipe(sourcemaps.write()) // Now the sourcemaps are added to the .js file
            .pipe(gulp.dest(outputPath));


        // gulp.src('src/**/*.ts')
        //     .pipe(ts({
        //         noImplicitAny: true,
        //         out: 'output.js'
        //     }))
        //     .pipe(gulp.dest('built/local'));
        //
        // let tsProject   = ts.createProject(`./custom/tsconfig.json`),
        //     tsResult    = tsProject.src()
        //         .pipe(sourcemaps.init())
        //         .pipe(tsProject());
        //
        // tsResult.js
        //     .pipe(sourcemaps.write('./'))
        //     .pipe(gulp.dest(`./dist/${dir}`))
        //     .on('end', () => {
        //
        //         // Copy assets
        //         gulp.src([inputPath + '/**/*', '!**/.ts'])
        //             .pipe(gulp.dest(outputPath))
        //             .on('end', () => {
        //                 console.info('GULP: Custom build complete');
        //             });
        //
        //     })
    });

    callback();
});

gulp.task('custom:compile', function() {

    if (!argv['input-path'] || !argv['output-path'])
        throw new Error('Gulp build custom, --input-path and --output-path must be defined');

    console.log('argv argv', argv);

    // let inputPath = _getInputAbsoluteRootFolder(event.path),
    //     outputPath = _getOutputAbsoluteRootFolder(event.path);

    // console.log('outputPath',  outputPath);
    // console.log('outputPath', 'outputPath', 'outputPath', 'outputPath', 'outputPath', outputPath);

    let pipes = [argv['input-path']].map(dir => {
        console.log('dir', 'dir', dir, argv['output-path']);

        return gulp.src(argv['input-path'])
            .pipe(webpack({
                entry: dir + '/',
                resolve: {
                    root: dir,
                    // Add `.ts` and `.tsx` as a resolvable extension.
                    extensions: ['.ts', '.js'],
                    alias: {
                        'tradejs/ea': path.join(__dirname, '/src/server/ea/EA'),
                        'tradejs/indicator/*': path.join(__dirname, '../dist/shared/indicators/*'),
                        'tradejs/indicator': path.join(__dirname, '../dist/shared/indicators/Indicator')
                    },
                    modulesDirectories: [
                        'node_modules'
                    ]
                },
                module: {
                    loaders: [
                        // all files with a `.ts` or `.tsx` extension will be handled by `ts-loader`
                        { test: /\.tsx?$/, loader: 'ts-loader' }
                    ]
                },
                externals: []
            }))
            .pipe(gulp.dest(argv['output-path']));
    });

    return es.merge(pipes);
});

gulp.task('custom:copy-assets', function(callback) {
    gulp.src([argv['input-path'] + '/**/*', '!**/.ts'])
        .pipe(gulp.dest(argv['input-path']))
        .on('error', (error) => {
            console.log(error);
        })
        .on('end', callback);
});

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