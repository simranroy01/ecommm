// webpack.config.js
const path = require('path');

module.exports = {
  entry: './cognito.js', // The main file where your app starts
  output: {
    filename: 'bundle.js', // The output file name
    path: path.resolve(__dirname, 'dist'), // Directory where bundle.js will be placed
  },
  module: {
    rules: [
      {
        test: /amazon-cognito-identity-js/,
        use: [
          {
            loader: 'exports-loader',
            options: {
              exports: 'AWSCognito',
            },
          },
        ],
      },
    ],
  },
};
