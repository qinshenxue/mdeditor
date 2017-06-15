var gulp = require('gulp'),
    rename = require("gulp-rename"),
    cleanCss = require("gulp-clean-css"),
    uglify = require('gulp-uglify'),
    jshint = require('gulp-jshint'),
    ftp = require('gulp-ftp'),
    syncConfig = require('./sync-config');


gulp.task('jshint', function () {
    return gulp.src('src/*.js')
        .pipe(jshint())
        .pipe(jshint.reporter('default'))
        .pipe(uglify())
        .pipe(rename({extname: ".min.js"}))
        .pipe(gulp.dest('dist/'));
});

gulp.task('css', function () {
    return gulp.src(['src/*.css'], {buffer: false})
        .pipe(cleanCss())
        .pipe(rename({extname: ".min.css"}))
        .pipe(gulp.dest('dist/'));
});


gulp.task('sync', function () {
    return gulp.src(['dist/*'])
        .pipe(ftp(Object.assign({}, syncConfig, {remotePath: '/demo/mdeditor/dist'})));
});

gulp.task('sync-index', function () {
    return gulp.src(['index.html'])
        .pipe(ftp(Object.assign({}, syncConfig, {remotePath: '/demo/mdeditor/'})));
});

gulp.task('server-css', function () {
    return gulp.src(['dist/*.css'])
        .pipe(ftp(Object.assign({}, syncConfig, {remotePath: '/static/css/'})));
});
gulp.task('server-js', function () {
    return gulp.src(['dist/*.js'])
        .pipe(ftp(Object.assign({}, syncConfig, {remotePath: '/static/js/'})));
});

//var tasks = ['jshint', 'css', 'sync', 'sync-index'];
var rollup = require('rollup').rollup;

gulp.task('build', function () {
    return rollup({
        entry: 'src/index.js',


        plugins: [
        ]
    }).then(function (bundle) {
        return bundle.write({
            format: 'umd',
            moduleName:'mdeditor',
            dest: 'dist/md.js'
        });
    });
});

gulp.task('watch',function () {
    gulp.watch(['src/**.js'], ['build']);
})

var tasks=['build']

gulp.task('default', tasks);
