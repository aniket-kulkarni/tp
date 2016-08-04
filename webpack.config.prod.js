var path = require('path');
var webpack = require('webpack');
var autoprefixer = require('autoprefixer');

var ExtractTextPlugin = require('extract-text-webpack-plugin');

module.exports = {
    devtool: 'source-map',
    entry: './src/app/index',
    output: {
        path: path.join(__dirname, 'dist'),
        filename: 'bundle.js',
        publicPath: '/static/'
    },
    devServer : {
        contentBase : './dist'
    },
    plugins: [
        // Optimize the order that items are bundled. This assures the hash is deterministic.
        new webpack.optimize.OccurenceOrderPlugin(),

        new webpack.DefinePlugin({
            'process.env.NODE_ENV': JSON.stringify('production')
        }),
        // Generate an external css file with a hash in the filename
        new ExtractTextPlugin('styles.css'),

        // Eliminate duplicate packages when generating bundle
        new webpack.optimize.DedupePlugin(),

        // Minify JS
        new webpack.optimize.UglifyJsPlugin()
    ],
    module: {
        loaders: [{
            test: /\.(js|jsx)$/,
            loaders: ['babel'],
            include: path.join(__dirname, 'src')
        },
        {
            test: /\.css/,
            include: [
                path.resolve(__dirname, 'src/app')
            ],
            loader : ExtractTextPlugin.extract('style', 'css?sourceMap&modules&importLoaders=1&localIdentName=[name]-[local]-[hash:base64:5]','postcss')
        },
        {
            test: /\.css/,
            exclude: [
                path.resolve(__dirname, 'src')
            ],
            loader : ExtractTextPlugin.extract('style', 'css')
        },
        {
            test: /\.css/,
            include: [
                path.resolve(__dirname, 'src/styles')
            ],
            loader : ExtractTextPlugin.extract('style', 'css','postcss')
        }]
    },
    postcss: function () {
        return [autoprefixer];
    },
    resolve : {
        extensions : ['','.js','.jsx']
    }
};
