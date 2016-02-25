'use strict';

var browserify = require('browserify');
var gulp = require('gulp');
var rename = require('gulp-rename');
var include = require('gulp-include');
var source = require('vinyl-source-stream');
var buffer = require('vinyl-buffer');
var uglify = require('gulp-uglify');
var gutil = require('gulp-util');

gulp.task('parser', function () {
  // set up the browserify instance on a task basis
  var b = browserify({
    entries: './src/parser/index.js',
    standalone: 'LP'
  });

  return b.bundle()
    .pipe(source('parser.js'))
    .pipe(buffer())
    .pipe(gulp.dest('./test/'));
});

gulp.task('default', ['parser'], function () {
	return gulp.src('./src/adaptor.js')
		.pipe(include())
		.pipe(rename('lemoncase.js'))
		.pipe(gulp.dest('./dist'))
		.pipe(rename('lemoncase.min.js'))
		.pipe(uglify())
		.pipe(gulp.dest('./dist'));
});