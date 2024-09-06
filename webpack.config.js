const path = require('path');
const Dotenv = require('dotenv-webpack');
const webpack = require('webpack');
const NodePolyfillPlugin = require('node-polyfill-webpack-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const dotenv = require('dotenv');

module.exports = (env, argv) => {
  const isProduction = argv.mode === 'production';
  const envPath = isProduction ? '.env.production' : '.env';
  const envVars = dotenv.config({ path: envPath }).parsed;

  return {
    mode: isProduction ? 'production' : 'development',
    entry: path.resolve(__dirname, 'src', 'index.js'),
    output: {
      path: path.resolve(__dirname, 'dist'),
      filename: 'bundle.js',
      publicPath: '/'
    },
    resolve: {
      extensions: ['.js', '.jsx', '.css'],
      modules: [path.resolve(__dirname, 'src'), 'node_modules'],
      fallback: {
        "fs": false,
        "path": require.resolve("path-browserify")
      },
      alias: {
        './Flashcard.css': path.resolve(__dirname, 'src/styles.css'),
        './Score.css': path.resolve(__dirname, 'src/styles.css'),
        './index.css': path.resolve(__dirname, 'src/styles.css'),
        './firebaseConfig': path.resolve(__dirname, 'src/firebaseConfig.js')
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
          test: /\.(png|jpe?g|gif)$/i,
          type: 'asset/resource',
        },
      ],
    },
    plugins: [
      new NodePolyfillPlugin(),
      new HtmlWebpackPlugin({
        template: path.resolve(__dirname, 'src', 'index.html'),
      }),
      new webpack.IgnorePlugin({
        resourceRegExp: /\.(Flashcard|Score|index)\.css$/,
      }),
      new Dotenv({
        path: isProduction ? '.env.production' : '.env',
        systemvars: true,
        safe: true
      }),
      new webpack.DefinePlugin({
        'process.env': JSON.stringify(envVars)
      }),
    ],
    performance: isProduction ? {
      maxEntrypointSize: 512000,
      maxAssetSize: 512000,
    } : false,
    devtool: isProduction ? 'source-map' : 'eval-source-map',
  };
};
