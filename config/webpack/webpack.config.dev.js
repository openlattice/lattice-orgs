/* eslint-disable import/extensions, import/no-extraneous-dependencies */

const HtmlWebpackPlugin = require('html-webpack-plugin');
const path = require('path');

const baseWebpackConfig = require('./webpack.config.base.js');

module.exports = (env) => {

  const baseConfig = baseWebpackConfig(env);

  const DEV_SERVER_PORT = 9000;

  const ROOT = path.resolve(__dirname, '../..');
  const BUILD = path.resolve(ROOT, 'build');
  const SOURCE = path.resolve(ROOT, 'src');

  return {
    ...baseConfig,
    devServer: {
      devMiddleware: {
        publicPath: baseConfig.output.publicPath,
      },
      historyApiFallback: {
        index: baseConfig.output.publicPath,
      },
      hot: true,
      port: DEV_SERVER_PORT,
      static: {
        directory: BUILD,
      },
    },
    devtool: false,
    output: {
      ...baseConfig.output,
      filename: 'static/js/index.js',
    },
    plugins: [
      new HtmlWebpackPlugin({
        favicon: `${SOURCE}/assets/svg/icons/ol-icon.svg`,
        template: `${SOURCE}/index.html`,
      }),
      ...baseConfig.plugins
    ],
  };
};
