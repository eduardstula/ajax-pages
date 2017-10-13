var src = [
    'src/ajax-pages.js'
];

const path = require('path');
var dest = path.resolve('dist/ajax-pages.min.js');

var fs = require('fs');
var uglify = require("uglify-js");

var uglified = uglify.minify(src);

fs.writeFile(dest, uglified.code, function (err){
    if(err) {
        console.log(err);
    } else {
        console.log("File generated and saved:", dest);
    }
});