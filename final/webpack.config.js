const path = require('path');

module.exports = {
  entry: './dist/index.js',
  output: {
    path: path.join(__dirname, 'dist/'),
    filename: 'bundle.js',
  },
  devtool: 'eval',
  module: {
    rules: [
      {
        test: /\.js$/,
        loader: 'babel-loader',
      },
      {
        test: /\.css$/,
        use: [
          { loader: 'style-loader' },
          {
            loader: 'css-loader',
            options: { module: true }
          }
        ]
      }
    ]
  }
}