/*
 * @Author: z
 * @Date: 2017-06-05 11:29:16
 * @Last Modified by: xieshengyong
 * @Last Modified time: 2019-01-02 11:34:27
 */
const path = require('path');
const webpack = require('webpack');
const config = require('./config.path');

const DefinePlugin = webpack.DefinePlugin;

const webpackMerge = require('webpack-merge');

const commonConfig = require('./webpack.config.base.js');

const HotModuleReplacementPlugin = webpack.HotModuleReplacementPlugin;

module.exports = function (env) {
    return webpackMerge(commonConfig(), {
        output: {
            path: path.resolve(__dirname, './dist'),
            filename: 'js/[name].js',
            publicPath: config.dev
        },
        module: {
            rules: [
                {
                    test: /\.less$/,
                    include: [
                        path.resolve(__dirname, 'src/less')
                    ],
                    use: [
                        {
                            loader: 'style-loader',
                            options: {}
                        },
                        {
                            loader: 'css-loader',
                            options: {}
                        },
                        {
                            loader: 'postcss-loader',
                            options: {}
                        },
                        {
                            loader: 'less-loader',
                            options: {}
                        }
                    ]
                },
                {
                    test: /\.(png|jpg|gif|svg|plist|int)$/,
                    include: [
                        path.resolve(__dirname, 'src/img')
                    ],
                    use: [
                        {
                            loader: 'url-loader',
                            options: {
                                limit: 1,
                                name: 'img/[name].[ext]'
                            }
                        }
                    ]
                },
                {
                    test: /\.(mp3|mp4)$/,
                    include: [
                        path.resolve(__dirname, 'src/media')
                    ],
                    use: [
                        {
                            loader: 'url-loader',
                            options: {
                                limit: 1,
                                name: 'img/[name].[ext]'
                            }
                        }
                    ]
                },
                {
                    test: /\.js$/,
                    include: [
                        path.resolve(__dirname, 'src/js')
                    ],
                    exclude: [
                        path.resolve(__dirname, 'src/js/lib'),
                        path.resolve(__dirname, 'src/js/app/rem.js')
                    ],
                    use: [
                        {
                            loader: 'babel-loader',
                            options: {
                                cacheDirectory: true,
                                presets: ['@babel/preset-env']
                            }
                        },
                        {
                            loader: 'eslint-loader'
                        }
                    ]
                }
            ]
        },
        plugins: [
            new DefinePlugin({
                'process.env': {
                    'NODE_ENV': JSON.stringify('dev'),
                    'PATH': JSON.stringify(config.dev)
                }
            }),
            new HotModuleReplacementPlugin()
        ],
        devServer: {
            host: '0.0.0.0',
            contentBase: [path.join(__dirname, './*.ejs'), path.join(__dirname, './src/')],
            compress: true,
            // port: 3000,
            inline: true,
            hot: true,
            disableHostCheck: true
        }
    });
};
