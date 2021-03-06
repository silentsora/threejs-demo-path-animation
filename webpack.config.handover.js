/**
 * Created by z on 2017/6/5.
 */
const path = require('path');
const webpack = require('webpack');
const config = require('./config.path');
const fs = require('fs');

const WebpackStrip = require('webpack-strip');

const HtmlWebpackPlugin = require('html-webpack-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const ExtractTextPlugin = require('extract-text-webpack-plugin');
const CleanPlugin = require('clean-webpack-plugin');

const DefinePlugin = webpack.DefinePlugin;

// const UglifyJSPlugin = require('uglifyjs-webpack-plugin');

var copyItem = [];

if (fs.existsSync('src/img/kf')) {
    copyItem.push({
        from: 'src/img/kf',
        to: './',
        flatten: true
    });
}

module.exports = function () {
    return {
        entry: {
            main: './src/js/index.js'
        },
        output: {
            path: path.resolve(__dirname, './dist/ossweb-img'),
            filename: '[name].[hash:8].js',
            publicPath: config.handover
        },
        module: {
            rules: [
                {
                    test: /\.less$/,
                    include: [
                        path.resolve(__dirname, 'src/less')
                    ],
                    use: ExtractTextPlugin.extract({
                        fallback: 'style-loader',
                        use: [
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
                    })
                },
                {
                    test: /\.js$/,
                    include: [
                        path.resolve(__dirname, 'src/js/lib')
                    ],
                    use: [
                        {
                            loader: 'url-loader',
                            options: {
                                limit: 1,
                                name: 'js/lib/[name].[ext]'
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
                        path.resolve(__dirname, 'src/js/lib')
                    ],
                    use: [
                        {
                            // loader:  WebpackStrip.loader('TD.debug(\\.\\w+)+', 'debug', 'console.log')
                            loader: WebpackStrip.loader('TD.debug(\\.\\w+)+', 'debug')
                        },
                        {
                            loader: 'babel-loader',
                            options: {
                                presets: ['@babel/preset-env']
                            }
                        },
                        {
                            loader: 'eslint-loader',
                            options: {}
                        }
                    ]
                },
                {
                    test: /\.(png|jpg|gif|svg)$/,
                    include: [
                        path.resolve(__dirname, 'src/img')
                    ],
                    use: [
                        {
                            loader: 'url-loader',
                            options: {
                                limit: 3000,
                                name: '[name].[hash:8].[ext]'
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
                                name: '[name].[hash:8].[ext]'
                            }
                        }
                    ]
                },
                {
                    test: /\.(vert|frag)$/,
                    use: 'raw-loader'
                }
            ]
        },
        resolve: {
            alias: {}
        },
        plugins: [
            new CleanPlugin(),
            new ExtractTextPlugin('[name].[hash:8].css'),
            new CopyWebpackPlugin(copyItem),
            new DefinePlugin({
                'process.env': {
                    'NODE_ENV': JSON.stringify('handover'),
                    'PATH': JSON.stringify(config.handover)
                }
            }),
            new HtmlWebpackPlugin({
                filename: '../index.html',
                template: 'index.ejs',
                inject: false,
                hash: false,
                minify: {
                    removeComments: true, // ??????HTML????????????
                    collapseWhitespace: false, // ???????????????????????????
                    minifyCSS: true, // ?????? HTML ???????????? CSS ??????
                    minifyJS: true // ?????? HTML ???????????? JS ??????
                }
            })
            // new UglifyJSPlugin({
            //     uglifyOptions: {
            //         compress: {
            //             drop_console: false
            //         }
            //     }
            // })
        ],
        externals: {
            '$': 'window.$',
            'global': 'window.global'
        }
    };
};
