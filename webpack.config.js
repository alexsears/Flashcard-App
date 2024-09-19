const path = require('path');
const Dotenv = require('dotenv-webpack');
const webpack = require('webpack');
const NodePolyfillPlugin = require('node-polyfill-webpack-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const TerserPlugin = require('terser-webpack-plugin');

module.exports = (env, argv) => {
  const isProduction = argv.mode === 'production';
  const envPath = isProduction ? '.env.production' : '.env';

  return {
    mode: isProduction ? 'production' : 'development',
    entry: path.resolve(__dirname, 'src', 'index.js'),
    output: {
      path: path.resolve(__dirname, 'build'), // Changed from 'dist' to 'build' to match CRA
      filename: isProduction ? '[name].[contenthash].js' : 'bundle.js',
      publicPath: '/'
    },
    resolve: {
      extensions: ['.js', '.jsx', '.css'],
      modules: [path.resolve(__dirname, 'src'), 'node_modules'],
      fallback: {
        "path": require.resolve("path-browserify"),
        "os": require.resolve("os-browserify/browser"),
        "crypto": require.resolve("crypto-browserify"),
        "stream": require.resolve("stream-browserify"),
        "buffer": require.resolve("buffer/"),
        "fs": false,
        "net": false,
        "tls": false
      },
      alias: {
        '@': path.resolve(__dirname, 'src'),
        'react-dom': '@hot-loader/react-dom'  // For hot reloading (if needed)
      }
    },
    module: {
      rules: [
        {
          test: /\.(js|jsx)$/,
          exclude: /node_modules/,
          use: ['babel-loader'],
        },
        {
          test: /\.css$/i,
          use: ['style-loader', 'css-loader'],
        },
        {
          test: /\.(png|jpe?g|gif|svg)$/i,
          type: 'asset/resource',
        },
      ],
    },
    plugins: [
      new NodePolyfillPlugin(),
      new HtmlWebpackPlugin({
        template: path.resolve(__dirname, 'public', 'index.html'), // Assuming index.html is in 'public' folder
        favicon: path.resolve(__dirname, 'public', 'favicon.ico'), // Add favicon if you have one
      }),
      new Dotenv({
        path: envPath,
        systemvars: true,
        safe: true
      }),
      new webpack.ProvidePlugin({
        process: 'process/browser',
        Buffer: ['buffer', 'Buffer']
      }),
      new webpack.DefinePlugin({
        'process.env.NODE_ENV': JSON.stringify(isProduction ? 'production' : 'development')
      }),
    ],
    optimization: {
      minimize: isProduction,
      minimizer: [new TerserPlugin()],
      splitChunks: {
        chunks: 'all',
      },
    },
    performance: isProduction ? {
      hints: 'warning',
      maxEntrypointSize: 512000,
      maxAssetSize: 512000,
    } : false,
    devtool: isProduction ? 'source-map' : 'eval-source-map',
    devServer: {
      historyApiFallback: true,
      hot: true,
      open: true,
    },
  };
};