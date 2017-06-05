const webpack = require('webpack')
const path = require('path')
const env = require('yargs').argv.env;
const ExtractTextPlugin = require('extract-text-webpack-plugin')
const OptimizeCssAssetsPlugin = require('optimize-css-assets-webpack-plugin')
const PackageJson = require('./package.json')

const resolve = dir => path.join(__dirname, '.', dir)


const banner = `CanvasTools v${PackageJson.version} 
(github)${PackageJson.homepage}
(url) https://smohan.net/lab/canvastools
(c) smohan <https://smohan.net>
license ${PackageJson.license}`


let plugins = [],
	outputFile;

if (env === 'build') {
	plugins = [
		new ExtractTextPlugin('canvastools.min.css'),
		new webpack.optimize.UglifyJsPlugin({
			minimize: true,
			comments: false,
			sourceMap: false,
		}),
		new OptimizeCssAssetsPlugin(),
		new webpack.BannerPlugin(banner),
	];
	outputFile = 'canvastools.min.js';
} else {
	plugins = [
		new ExtractTextPlugin('canvastools.css'),
		new webpack.BannerPlugin(banner),
	]
	outputFile = 'canvastools.js';
}

module.exports = {
	entry: './src/js/main',
	devtool: env !== 'build' ? 'source-map' : false,
	output: {
		path: __dirname + '/dist',
		filename: outputFile,
		library: 'CanvasTools',
		libraryTarget: 'umd',
		umdNamedDefine: true
	},
	module: {
		rules: [{
			test: /\.js$/,
			loader: 'babel-loader',
			include: [resolve('src')]
		}, {
			test: /\.css$/,
			use: ExtractTextPlugin.extract(['css-loader', 'postcss-loader'])
		}, {
			test: /\.scss$/,
			use: ExtractTextPlugin.extract(['css-loader', 'sass-loader', 'postcss-loader'])
		}]
	},
	resolve: {
		modules: [resolve('src')],
		extensions: ['.json', '.js'],
		alias: {
			'@': resolve('src')
		}
	},
	plugins: plugins
}