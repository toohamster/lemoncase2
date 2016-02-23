'use strict';

var browserify = require('browserify');
var gulp = require('gulp');
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