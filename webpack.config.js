const path = require('path');
const Dotenv = require('dotenv-webpack');

module.exports = {
  // ... other webpack configuration options

  resolve: {
    // ... other resolve configurations

    fallback: {
      path: require.resolve('path-browserify'),
      os: require.resolve('os-browserify/browser'),
      crypto: require.resolve('crypto-browserify')
    }
  },

  module: {
    rules: [
      // ... other rules

      {
        test: /\/node_modules\/@firebase\/installations\/node_modules\/idb\/build\/index\.js$/,
        use: 'null-loader'
      },
      {
        test: /\/node_modules\/@firebase\/installations\/node_modules\/idb\/.*\.js$/,
        loader: 'babel-loader',
        options: {
          presets: ['@babel/preset-env'],
        }
      },
      {
        test: /\.js$/,
        exclude: /node_modules\/(?!@firebase\/installations\/node_modules\/idb)/,
        use: {
          loader: 'babel-loader',
          options: {
            presets: ['@babel/preset-env', '@babel/preset-react']
          }
        }
      }
    ]
  },

  plugins: [
    // ... other plugins
    new Dotenv()
  ]
};
