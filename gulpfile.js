const gulp = require('gulp')
const rename = require("gulp-rename")
const cleanCss = require("gulp-clean-css")
const eslint = require('gulp-eslint')
const uglify = require('rollup-plugin-uglify')
const babel = require('rollup-plugin-babel')
const rollup = require('rollup').rollup


gulp.task('css', function () {
    return gulp.src(['src/**.css'])
        .pipe(cleanCss())
        .pipe(rename({
            extname: ".min.css"
        }))
        .pipe(gulp.dest('dist/'));
})


gulp.task('eslint', () => {
    return gulp.src(['src/**.js'])
        .pipe(eslint())
        .pipe(eslint.format())
})


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
        })
    })
})

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
        })
    })
})

gulp.task('build', ['eslint', 'css', 'rollup-umd', 'rollup-es'])

gulp.task('dev', function () {
    gulp.watch(['src/**.js', 'src/**.css'], ['build'])
})
