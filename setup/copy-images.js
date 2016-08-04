var fs = require('fs-extra');
var colors = require('colors');
const path = require('path');

var src = path.join(__dirname, '../src/images');
var dest = path.join(__dirname, '../dist/images/');

fs.copy(src,dest,(err) => {
    if (err) {
        console.log(err.red);
    } else {
        console.log('\nCopied images to dist'.green);
    }
});
