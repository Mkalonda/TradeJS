const
    gulp = require('gulp'),
    sourcemaps = require('gulp-sourcemaps'),
    fork = require('child_process').fork,
    runSequence = require('run-sequence'),
    ts = require('gulp-typescript'),
    debug = require('debug')('TradeJS:Gulp'),
    es = require("event-stream");

const PATH_APP_INIT_FILE = 'dist/server/bin/www.js';

let node = null;
/***************************************************************
 *
 * SERVER SERVER SERVER SERVER SERVER SERVER SERVER
 *
 **************************************************************/

gulp.task('server:dev', function(callback) {
    runSequence('server:compile:run', ['server:watch'], callback);
});

gulp.task('server:kill', killProcess);

gulp.task('server:run', function(callback) {

    node = fork(PATH_APP_INIT_FILE, [], {
        detached: true,
        env: process.env,
        stdio: ['pipe', process.stdout, process.stderr, 'ipc'],
    });

    callback();
    //
    // node.on('message', message => {
    //     if (message === 'app:ready') {
    //         callback();
    //     }
    // });
});

gulp.task('server:compile', function() {

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

gulp.task('server:compile:run', function() {
    runSequence('server:kill', ['server:compile'], 'server:run');
});

gulp.task('server:watch', [], function() {
    gulp.watch(['./src/server/**/*.ts', './src/shared/**/*.ts'], ['server:compile:run']);
});


/***************************************************************
 *
 * SHARED SHARED SHARED SHARED SHARED SHARED SHARED
 *
 **************************************************************/

// gulp.task('shared:watch', [], function() {
//     gulp.watch('./src/shared/**/*.ts', ['shared:compile']);
// });
//
// gulp.task('shared:compile', function() {
//
//     let tsProject = ts.createProject(`./src/shared/tsconfig.json`),
//         tsResult = tsProject.src()
//             .pipe(sourcemaps.init())
//             .pipe(tsProject());
//
//     return tsResult.js
//         .pipe(sourcemaps.write('./'))
//         .pipe(gulp.dest(`./dist/shared`))
// });


/***************************************************************
 *
 * FORK FORK FORK FORK FORK FORK FORK
 *
 **************************************************************/
function killProcess(callback) {
    if (node && node.pid) {
        node.on('close', () => {
            debug("Child closed");
            typeof callback == 'function' && callback && callback();
        });

        process.kill(-node.pid, 'SIGTERM');

        node = null;
    } else {
        typeof callback == 'function' && callback();
    }
}

process.on('exit', killProcess);
process.on('SIGINT', () => {
    killProcess();
    process.exit();
});
//process.on('SIGHUP', killProcess);