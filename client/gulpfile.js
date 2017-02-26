'use strict';

const
    tslint = require('gulp-tslint'),
    path = require('path'),
    gulp = require('gulp');

gulp.task('tslint', () => {

    gulp.src(["./app/**/*.ts", '!./node_modules/', '!./dist/'])
        .pipe(tslint({
            //configuration: "../tslint.json",
            formatter: "prose"
        }))
        .on('error', (err) => {
            console.log(err);
        })
        .pipe(tslint.report())

});

// gulp.task('build', (callback) => {
//     const
//         outputPath = path.join(__dirname, 'dist', 'client'),
//         buildNode = spawn('./node_modules/.bin/ng', ['build', '--prod', `--output-path=${outputPath}`], {
//             stdio: ['pipe', process.stdout, process.stderr, 'ipc'],
//             cwd: './src/client'
//         });
//
//     buildNode.on('exit', () => {
//         callback();
//     })
// });
//
// gulp.task('copy-assets', () => {
//     gulp.src(['./src/client/**/*.html', '!**/index.html'])
//         .pipe(gulp.dest('./dist/client'));
// });

