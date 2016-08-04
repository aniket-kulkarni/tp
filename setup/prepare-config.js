var yargs = require('yargs').argv;
var config = require('../config/config.json');
var colors = require('colors');
var fs = require('fs');
const path = require('path');

var env = yargs.env || 'development';
env = config[env] ? env : 'development';

var data = config[env];

console.log(('Preparing config for ' + env + ' environment').bold.yellow);
var dest = path.join(__dirname, '../src/app/config/config.js');

fs.writeFile(dest, `/*eslint-disable quotes*/\n\nvar config = ${JSON.stringify(data)};\nmodule.exports = config;`, (err) => {
    if (err) throw err;
    console.log('Config generated\n'.bold.yellow);
});
