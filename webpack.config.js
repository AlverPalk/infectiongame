const path = require('path');
const TerserWebpackPlugin = require('terser-webpack-plugin');
const OptimizeCSSAssetsPlugin = require('optimize-css-assets-webpack-plugin');
const MinCSSExtractPlugin = require('mini-css-extract-plugin');
const LimitChunk = require('webpack').optimize.LimitChunkCountPlugin;
const HTMLWebpackPlugin = require('html-webpack-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');

module.exports = (env, args) => {
    return {
        entry: './src/ts/canvas.js',
        output: {
            filename: 'js/bundle.js',
            path: path.resolve(__dirname, 'dist')
        },

        devServer: {
            contentBase: './dist'
        },
        optimization: {
            minimize: true,
            minimizer: [
                new TerserWebpackPlugin(),
                new OptimizeCSSAssetsPlugin()
            ]
        },

        plugins: [
            new MinCSSExtractPlugin({
                filename: 'css/bundle.min.css'
            }),
            // Disable code splitting
            new LimitChunk({
                maxChunks: 1
            }),
            new HTMLWebpackPlugin({
                filename: 'index.html',
                template: "src/index.html"
            }),
            new CopyWebpackPlugin([{
                from: './src/img',
                to: './img'
            }])
        ],

        module: {
            rules: [
                {
                    test: /\.(sa|sc|c)ss$/,
                    use: [
                        (args.mode !== 'production') ? 'style-loader' : MinCSSExtractPlugin.loader,
                        { loader: 'css-loader', options: { url: false, sourceMap: true } },
                        { loader: 'sass-loader', options: { sourceMap: true } }
                    ]
                }
            ]
        }
    }
}