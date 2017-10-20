const NODE_ENV = process.env.NODE_ENV || 'development';

if (NODE_ENV === 'production') {
  require('./server.babel'); // babel registration (runtime transpilation for node)
}

const webpack = require('webpack');
const ExtractTextPlugin = require('extract-text-webpack-plugin');
const path = require('path');
const dotenv = require('dotenv');

dotenv.config();

const config = require('./config');

const host = process.env.HOST || config.host || 'localhost';
const port = process.env.PORT || config.port + 1;

const publicPath = NODE_ENV === 'development' ? `http://${host}:${port}/build/` : '/build/';

module.exports = {
  devtool: NODE_ENV === 'development' ? 'inline-source-map' : undefined,

  context: path.join(__dirname, 'src'),

  entry: {
    app: (NODE_ENV === 'development' ? [
      `webpack-dev-server/client?http://${host}:${port}`,
      'webpack/hot/only-dev-server',
      'react-hot-loader/patch',
    ] : []).concat([
      'babel-polyfill',
      './index'
    ]),
  },

  output: {
    path: path.join(__dirname, NODE_ENV === 'development' ? './build' : './public/build'),
    publicPath,
    filename: NODE_ENV === 'development' ? '[name].js?hash=[hash]' : '[name].js',
    chunkFilename: NODE_ENV === 'development' ? '[name].js?hash=[chunkhash]' : '[name].js'
  },

  module: {
    rules: [
      {
        test: /\.jsx?$/,
        exclude: /\/node_modules\//,
        use: (NODE_ENV === 'development' ? [
          'react-hot-loader/webpack',
        ] : []).concat('babel-loader'),
      },
      {
        test: /\.css$/,
        loader: ExtractTextPlugin.extract({
          fallback: 'style-loader',
          use: ['css-loader', 'postcss-loader']
        }),
      },
      {
        test: /.(png|jpg|gif|woff(2)?|eot|ttf|svg)(\?[a-z0-9=\.]+)?$/,
        include: /\/node_modules\//,
        loader: 'file-loader?name=[1].[ext]?hash=[hash:6]&regExp=node_modules/(.*)',
      },
      {
        test: /.(png|jpg|gif|woff(2)?|eot|ttf|svg)(\?[a-z0-9=\.]+)?$/,
        exclude: /\/node_modules\//,
        loader: 'file-loader?name=[path][name].[ext]?hash=[hash:6]',
      },
    ],
  },

  resolve: {
    extensions: [
      '.js', '.jsx', '.json', '.css', '.html', 'woff', 'woff2', 'eot', 'ttf', 'svg', 'png', 'jpg', 'gif',
    ],
    modules: ['node_modules'],
  },

  plugins: [
    new webpack.NoEmitOnErrorsPlugin(),
    new webpack.IgnorePlugin(/moment\/min\/locales/),
    new ExtractTextPlugin({
      filename: '[name].css',
      disable: NODE_ENV === 'development',
      allChunks: true,
    }),
    new webpack.DefinePlugin({
      'process.env': {
        __CLIENT__: JSON.stringify(true),
        __DEVTOOLS__: JSON.stringify(true),
        NODE_ENV: JSON.stringify(NODE_ENV),
        API_HOST: JSON.stringify(process.env.API_HOST),
        YELP_HOST: JSON.stringify(process.env.YELP_HOST),
        EVENTBRITE_API_HOST: JSON.stringify(process.env.EVENTBRITE_API_HOST),
        EVENTBRITE_TOKEN: JSON.stringify(process.env.EVENTBRITE_TOKEN),
        UPLOAD_HOST: JSON.stringify(process.env.UPLOAD_HOST),
        PARSE_APPLICATION_ID: JSON.stringify(process.env.PARSE_APPLICATION_ID),
        PARSE_MASTER_KEY: JSON.stringify(process.env.PARSE_MASTER_KEY),
        GOOGLE_MAP_API_KEY: JSON.stringify(process.env.GOOGLE_MAP_API_KEY),
        FACEBOOK_APP_ID: JSON.stringify(process.env.FACEBOOK_APP_ID)
      }
    }),
    ...(NODE_ENV === 'development' ? [
      new webpack.HotModuleReplacementPlugin(),
      new webpack.NamedModulesPlugin(),
      new webpack.ContextReplacementPlugin(/node_modules\/moment\/locale/, /en-gb/), // include only en locales in moment
    ] : [
      new webpack.ContextReplacementPlugin(/moment[\/\\]locale$/, /en-gb/), // include only ru|en locales in moment
      new webpack.optimize.UglifyJsPlugin({
        compress: {
          warnings: false,
          drop_console: false,
          unsafe: false
          // screw_ie8: true
        }
      })
    ]),
  ],
  
  devServer: {
    proxy: {
      '/**': {
        target: '/index.html',
        secure: false,
        bypass: (req, res, opt) => '/index.html',
      }
    },
    contentBase: path.join(__dirname, 'public'),
    lazy: false,
    quiet: false,
    noInfo: false,
    inline: true,
    hot: true,
    stats: { colors: true },
    headers: {'Access-Control-Allow-Origin': '*'},
    port, publicPath,
  },
};
