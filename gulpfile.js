var gulp = require('gulp'),
    rename = require("gulp-rename"),
    cleanCss = require("gulp-clean-css"),
    uglify = require('gulp-uglify'),
    jshint = require('gulp-jshint'),
    ftp = require('gulp-ftp'),
    syncConfig = require('./sync-config');

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


gulp.task('sync', function () {
    return gulp.src(['dist/*'])
        .pipe(ftp(Object.assign({}, syncConfig, {
            remotePath: '/demo/mdeditor/dist'
        })));
});

gulp.task('sync-index', function () {
    return gulp.src(['index.html'])
        .pipe(ftp(Object.assign({}, syncConfig, {
            remotePath: '/demo/mdeditor/'
        })));
});

gulp.task('server-css', function () {
    return gulp.src(['dist/*.css'])
        .pipe(ftp(Object.assign({}, syncConfig, {
            remotePath: '/static/css/'
        })));
});
gulp.task('server-js', function () {
    return gulp.src(['dist/*.js'])
        .pipe(ftp(Object.assign({}, syncConfig, {
            remotePath: '/static/js/'
        })));
});

//var tasks = ['jshint', 'css', 'sync', 'sync-index'];
var rollup = require('rollup').rollup;

gulp.task('lint', () => {
    // ESLint ignores files with "node_modules" paths.
    // So, it's best to have gulp ignore the directory as well.
    // Also, Be sure to return the stream from the task;
    // Otherwise, the task may end before the stream has finished.
    return gulp.src(['src/**.js'])
        // eslint() attaches the lint output to the "eslint" property
        // of the file object so it can be used by other modules.
        .pipe(eslint())
        // eslint.format() outputs the lint results to the console.
        // Alternatively use eslint.formatEach() (see Docs).
        .pipe(eslint.format())
});

gulp.task('build', function () {
    return rollup({
        entry: 'src/index.js',


        plugins: [babel({
            exclude: 'node_modules/**'
        })]
    }).then(function (bundle) {
        return bundle.write({
            format: 'umd',
            moduleName: 'mdeditor',
            dest: 'dist/md.js'
        });
    });
});

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
            moduleName: 'md',
            dest: 'dist/markdown.js'
        });
    });
});

gulp.task('watch-markdown', function () {
    gulp.watch(['src/markdown.js'], ['markdown']);
})

gulp.task('watch', function () {
    gulp.watch(['src/**.js'], ['build']);
})

gulp.task('enote', function () {

    gulp.src(['./dist/md.js'], {
            buffer: false
        })
        .pipe(
            gulp.dest('E:/oschina/ENote/src/lib')
        )


});

var tasks = ['watch']

gulp.task('default', tasks);
