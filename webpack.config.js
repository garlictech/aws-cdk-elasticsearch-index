const path = require('path');

module.exports = {
  mode: 'development',
  target: 'node',
  entry: {
    'on-event': './src/on-event/on-event.ts'
  },
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        use: [
          {
            loader: 'ts-loader?configFile=tsconfig.src.json',
            options: {
              transpileOnly: true,
            },
          },
        ],
        exclude: [
          /test/,
          /cdk.out/,
          /lib/,
          /node_modules/,
        ],
      },
    ],
  },
  resolve: {
    extensions: ['.ts', '.tsx', '.js', '.json'],
  },
  externals: ['aws-sdk'],
  output: {
    filename: '[name]/[name].js',
    path: path.resolve(__dirname, 'dist', 'src'),
    libraryTarget: 'commonjs',
  },
  optimization: {
    minimize: false,
  },
};
