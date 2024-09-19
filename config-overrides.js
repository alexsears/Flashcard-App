const path = require('path');
const webpack = require('webpack');
const { override, addWebpackPlugin, addWebpackAlias, addBabelPlugin } = require('customize-cra');
const NodePolyfillPlugin = require('node-polyfill-webpack-plugin');

module.exports = override(
  addWebpackPlugin(new NodePolyfillPlugin()),
  addBabelPlugin(["@babel/plugin-proposal-private-property-in-object", { "loose": true }]),
  addBabelPlugin(["@babel/plugin-proposal-class-properties", { "loose": true }]),
  addBabelPlugin(["@babel/plugin-proposal-private-methods", { "loose": true }]),
  (config) => {
    const fallback = config.resolve.fallback || {};
    Object.assign(fallback, {
      "crypto": require.resolve("crypto-browserify"),
      "stream": require.resolve("stream-browserify"),
      "assert": require.resolve("assert"),
      "http": require.resolve("stream-http"),
      "https": require.resolve("https-browserify"),
      "os": require.resolve("os-browserify"),
      "url": require.resolve("url"),
      "path": require.resolve("path-browserify"),
      "fs": false,
      "child_process": false,
      "net": false,
      "tls": false
    });
    config.resolve.fallback = fallback;

    config.plugins = (config.plugins || []).concat([
      new webpack.ProvidePlugin({
        process: 'process/browser',
        Buffer: ['buffer', 'Buffer']
      }),
      new webpack.NormalModuleReplacementPlugin(/node:/, (resource) => {
        const mod = resource.request.replace(/^node:/, "");
        switch (mod) {
          case "fs":
          case "child_process":
          case "net":
          case "tls":
            resource.request = "node-libs-browser/mock/" + mod;
            break;
          default:
            break;
        }
      })
    ]);

    config.ignoreWarnings = (config.ignoreWarnings || []).concat([/Failed to parse source map/]);

    return config;
  },
  addWebpackAlias({
    '@': path.resolve(__dirname, 'src')
  })
);