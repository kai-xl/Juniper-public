const path = require('path');

module.exports = {
  mode: 'development',
  entry: {
    renderer: './src/renderer.jsx', // We'll rename renderer.js to renderer.jsx
  },
  target: 'electron-renderer',
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: '[name].bundle.js'
  },
  module: {
    rules: [
      {
        test: /\.(js|jsx)$/,
        exclude: /node_modules/,
        use: {
          loader: 'babel-loader',
          options: {
            presets: [
              '@babel/preset-env',
              '@babel/preset-react'
            ]
          }
        }
      },
      {
        test: /\.css$/,
        use: ['style-loader', 'css-loader', 'postcss-loader']
      },
      {
        test: /\.(png|jpg|gif|svg)$/,
        use: [
          {
            loader: 'file-loader',
            options: {
              outputPath: 'images/'
            }
          }
        ]
      }
    ]
  },
  resolve: {
    extensions: ['.js', '.jsx', '.json']
  },
  devtool: 'cheap-module-source-map'
};