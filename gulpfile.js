var gulp = require('gulp'),
    rename = require("gulp-rename"),
    cleanCss = require("gulp-clean-css"),
    uglify = require('gulp-uglify'),
    jshint = require('gulp-jshint'),
    ftp = require('gulp-ftp');
var eslint = require('gulp-eslint');
var uglify = require('rollup-plugin-uglify')
var babel = require('rollup-plugin-babel')
var flow = require('rollup-plugin-flow');

gulp.task('jshint', function () {
    return gulp.src('src/*.js')
        .pipe(jshint())
        .pipe(jshint.reporter('default'))
        .pipe(uglify())
        .pipe(rename({
            extname: ".min.js"
        }))
        .pipe(gulp.dest('dist/'));
});

gulp.task('css', function () {
    return gulp.src(['src/*.css'], {
        buffer: false
    })
        .pipe(cleanCss())
        .pipe(rename({
            extname: ".min.css"
        }))
        .pipe(gulp.dest('dist/'));
});


var rollup = require('rollup').rollup;

gulp.task('lint', () => {
    return gulp.src(['src/**.js'])
        .pipe(eslint())
        .pipe(eslint.format())
});


gulp.task('rollup-umd', function () {
    return rollup({
        input: 'src/index.js',
        plugins: [babel({
            exclude: 'node_modules/**'
        }), uglify()]
    }).then(function (bundle) {
        bundle.write({
            format: 'umd',
            name: 'mdeditor',
            file: 'dist/mdeditor.js'
        });
    })
});

gulp.task('rollup-es', function () {
    return rollup({
        input: 'src/index.js',
        plugins: [babel({
            exclude: 'node_modules/**'
        })]
    }).then(function (bundle) {
        bundle.write({
            format: 'es',
            file: 'dist/mdeditor.es.js'
        });
    })
});

gulp.task('build', ['rollup-umd', 'rollup-es'])

gulp.task('markdown', function () {
    return rollup({
        entry: 'src/markdown.js',

        plugins: [
            babel({
                exclude: 'node_modules/**'
            }), uglify()
        ]
    }).then(function (bundle) {
        return bundle.write({
            format: 'iife',
            name: 'md',
            file: 'dist/markdown.js'
        });
    });
});

gulp.task('watch-markdown', function () {
    gulp.watch(['src/markdown.js'], ['markdown']);
})

gulp.task('watch', function () {
    gulp.watch(['src/**.js'], ['build']);
})

var tasks = ['watch']

gulp.task('default', tasks);
