var uglify = require('uglify-js');
var browserify = require('browserify');
var watchify = require('watchify');
var fs = require('fs');

var b = browserify();
b.add('./index.js');
b.bundle().pipe(fs.createWriteStream('./dist/npcanvas.js'));