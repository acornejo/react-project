var gulp = require('gulp');
var gulpif = require('gulp-if');
var livereload = require('gulp-livereload');
var uglify = require('gulp-uglify');
var react = require('gulp-react');
var jshint = require('gulp-jshint');
var streamify = require('gulp-streamify');
var htmlmin = require('gulp-htmlmin');
var concat = require('gulp-concat');
var minify = require('gulp-minify-css');
var sass = require('gulp-sass');
var sourcemaps = require('gulp-sourcemaps');
var browserify = require('browserify');
var watchify = require('watchify');
var source = require('vinyl-source-stream');

var production = process.env.NODE_ENV === 'production';

var http_port = 8888;
var lr_port = 35729;

var dist = 'dist';
var vendor = ['react'];
var entryFile = './src/jsx/main.jsx';
var htmlFiles = 'src/**/*.html';
var jsFiles = 'src/**/*.js';
var jsxFiles = 'src/**/*.jsx';
var scssFiles = 'src/**/*.scss';
var scssIncludes = ['./node_modules/bootstrap-sass/assets/stylesheets', './node_modules/font-awesome/scss'];

gulp.task('html', function () {
  return gulp.src(htmlFiles)
    .pipe(gulpif(production, htmlmin({collapseWhitespace: true})))
    .pipe(gulp.dest(dist));
});

gulp.task('css', function () {
  return gulp.src(scssFiles)
    .pipe(gulpif(!production, sourcemaps.init()))
    .pipe(sass({ includePaths: scssIncludes }))
    .pipe(gulpif(!production, sourcemaps.write()))
    .pipe(concat("style.css"))
    .pipe(gulpif(production, minify()))
    .pipe(gulp.dest(dist));
});

gulp.task('jslint', function () {
  return gulp.src(jsFiles)
    .pipe(jshint())
    .pipe(jshint.reporter('default'));
});

gulp.task('jsxlint', function () {
  return gulp.src(jsxFiles)
    .pipe(react())
    .pipe(jshint())
    .pipe(jshint.reporter('default'));
});

gulp.task('watch', function () {
  gulp.watch(htmlFiles, ['html']);
  gulp.watch(jsFiles, ['jslint']);
  gulp.watch(jsxFiles, ['jsxlint']);
  gulp.watch(scssFiles, ['css']);
});

gulp.task('vendor', function () {
  return browserifyTask({
    require: vendor,
    outdir: dist,
    outfile: 'vendor.js',
    production: production,
    watch: false
  });
});

gulp.task('bundle', function () {
  return browserifyTask({
    entries: entryFile,
    dependencies: vendor,
    outdir: dist,
    outfile: 'app.js',
    production: production,
    watch: false
  });
});

gulp.task('bundle-rebuild', function () {
  return browserifyTask({
    entries: entryFile,
    dependencies: vendor,
    outdir: dist,
    outfile: 'app.js',
    production: production,
    watch: true
  });
});

function browserifyTask(options) {
  var bundler = browserify({
    entries: options.entries,
    debug: !options.production,
    require: options.require,
    cache: {},
    fullPaths: !options.production || options.watch});

  if (options.dependencies)
    bundler.external(options.dependencies);

  var rebundle = function () {
    return bundler.bundle()
      .on('error', function (msg) {
        gulp.emit('task_err', {task: 'browserify', message: msg});
      })
      .pipe(source(options.outfile))
      .pipe(gulpif(options.production, streamify(uglify())))
      .pipe(gulp.dest(options.outdir));
  };

  if (options.watch) {
    var first_rebuild = true;
    bundler = watchify(bundler);
    bundler.on('update', function () {
      gulp.emit('task_start', {task: 'browserify' });
      rebundle();
    });
    bundler.on('time', function (ms) {
      var seconds = Math.floor(ms/1000);
      var nanoseconds = ms*1e6-seconds*1e9;
      var duration = [seconds, nanoseconds];
      if (!first_rebuild)
        gulp.emit('task_stop', {task: 'browserify', hrDuration: duration });
      first_rebuild = false;
    });
  }

  return rebundle();
}

gulp.task('livereload', function () {
  livereload.listen({port: lr_port});
  gulp.watch([dist + '/**/*'], function (e) { livereload.changed(e.path); });
});

gulp.task('server', ['livereload'], function (next) {
  var connect = require('connect');
  connect()
    .use(require('connect-livereload')({port: lr_port}))
    .use(require('serve-static')(dist))
    .listen(http_port, next);
});

gulp.task('dist', ['html', 'css', 'jslint', 'jsxlint', 'vendor', 'bundle'] );
gulp.task('default', ['html', 'css', 'jslint', 'jsxlint', 'vendor', 'bundle-rebuild', 'server', 'watch']);
