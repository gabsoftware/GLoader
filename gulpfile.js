// Include Gulp
var gulp = require( "gulp" );

// Include Our Plugins
var jshint = require( "gulp-jshint"  );
var concat = require( "gulp-concat"  );
var uglify = require( "gulp-uglify"  );
var rename = require( "gulp-rename"  );
var merge  = require( "merge-stream" );

// Lint Task
gulp.task( "lint", function() {
    var dgraphjs = gulp.src( "./lib/dependency-graph/lib/*.js" )
        .pipe( jshint() )
        .pipe( jshint.reporter( "default" ) );
    var gloaderjs = gulp.src( "./js/*.js" )
        .pipe( jshint() )
        .pipe( jshint.reporter( "default" ) );
    return merge( dgraphjs, gloaderjs );
});

// Concatenate & Minify JS
gulp.task( "scripts", function() {
    return gulp.src( [ "./lib/dependency-graph/lib/*.js", "./js/*.js" ] )
        .pipe( concat( "gloader-all.js" ) )
        .pipe( gulp.dest( "dist" ) )
        .pipe( rename( "gloader-all.min.js" ) )
        .pipe( uglify().on( "error", function( e ) {
            console.log( e );
        } ) )
        .pipe( gulp.dest( "dist" ) );
});

// Watch Files For Changes
gulp.task( "watch", function() {
    gulp.watch( [ "./lib/dependency-graph/lib/*.js", "./js/*.js" ], [ "lint", "scripts" ] );
});

gulp.task( "default", [ "lint", "scripts", "watch" ] );