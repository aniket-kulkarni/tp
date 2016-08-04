var path = require('path');
var webpack = require('webpack');
var autoprefixer = require('autoprefixer');

module.exports = {
    devtool: 'eval-source-map',
    entry: [
        'react-hot-loader/patch',
        'webpack-dev-server/client?http://localhost:3001',
        'webpack/hot/only-dev-server',
        '../src/app/index'
    ],
    output: {
        path: path.join(__dirname, 'dist'),
        filename: 'bundle.js',
        publicPath: '/'
    },
    plugins: [
        new webpack.DefinePlugin({
            'process.env.NODE_ENV': JSON.stringify('development'), // Tells React to build in either dev or prod modes. https://facebook.github.io/react/downloads.html (See bottom)
            __DEV__: true
        }),
        new webpack.HotModuleReplacementPlugin(),
        new webpack.NoErrorsPlugin()
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
            loaders : ['style', 'css?sourceMap&modules&importLoaders=1&localIdentName=[name]-[local]-[hash:base64:5]','postcss']
        },
        {
            test: /\.css/,
            exclude: [
                path.resolve(__dirname, 'src')
            ],
            loaders : ['style', 'css']
        },
        {
            test: /\.css/,
            include: [
                path.resolve(__dirname, 'src/styles')
            ],
            loaders : ['style', 'css','postcss']
        }]
    },
    postcss: function () {
        return [autoprefixer];
    },
    resolve : {
        extensions : ['','.js','.jsx']
    }
};
