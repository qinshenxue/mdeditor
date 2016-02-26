var gulp = require('gulp'),
    rename = require("gulp-rename"),
    uglify = require('gulp-uglify');

gulp.task('compress', function () {
    return gulp.src('mdeditor.js')
        .pipe(uglify())
        .pipe(rename({extname: ".min.js"}))
        .pipe(gulp.dest('./'));
});

gulp.task('default', ['compress']);
