var webpack = require('webpack');
var WebpackDevServer = require('webpack-dev-server');
var config = require('../webpack.config.dev');
var open = require("open");
var colors = require('colors');

const port = 3001;

/* eslint-disable no-console */

console.log('\nStarting app in dev mode...'.bold.blue);

new WebpackDevServer(webpack(config), {
    publicPath: config.output.publicPath,
    hot: true,
    historyApiFallback: true,
    contentBase : '../src',
    stats: {
        colors: true // color is life
    }
}).listen(port, 'localhost', function (err) {
    if (err) {
        return console.log(err);
    }
    open(`http://localhost:${port}/`);
    console.log(`\nListening at http://localhost:${port}/`.bold.green);
});
