const gulp = require('gulp');
const gutil = require('gulp-util');
const notify = require('gulp-notify');
const less = require('gulp-less');
const cleanCSS = require('gulp-clean-css');
const rename = require("gulp-rename");
const ts = require('gulp-typescript');
const uglify = require('gulp-uglify');

const lessDir = 'client/less';

const targetCSSDir = 'public/assets/css';

const tsDir = 'client/ts';

const targetJSDir = 'public/assets/js'

gulp.task('less', () => {
    return gulp.src(lessDir + '/*.less')
        .pipe(less().on('error', gutil.log))
        .pipe(cleanCSS({compatibility: 'ie8'}))
        .pipe(rename({ suffix: '.min' }))
        .pipe(gulp.dest(targetCSSDir))
        // .pipe(notify('Less compilated'))
});

gulp.task('ts', () => {
    return gulp.src(tsDir + '/*.ts')
        .pipe(ts())
        .pipe(uglify())
        .pipe(rename({ suffix: '.min' }))
        .pipe(gulp.dest(targetJSDir))
        // .pipe(notify('TypeScript compilated'))
});

gulp.task('watch', function () {
    gulp.watch(lessDir + '/*.less', ['less']);
    gulp.watch(tsDir + '/*.ts', ['ts']);
});

gulp.task('default', ['less', 'ts', 'watch']);