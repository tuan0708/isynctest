let path = require('path');
let HtmlWebpackPlugin = require('html-webpack-plugin');
let MiniCssExtractPlugin = require('mini-css-extract-plugin');
let webpack = require('webpack');
require('dotenv').config();

let cors = require('cors');
let cookieParser = require('cookie-parser');
let bodyParser = require('body-parser');
let session = require('express-session');

let isyncController = require('./app/controllers/ISync');
let accountController = require('./app/controllers/Account');
let marketController = require('./app/controllers/Market');
let othersController = require('./app/controllers/Others');

var basePath = __dirname;

module.exports = {
  context: path.join(basePath, 'src'),
  resolve: {
    extensions: ['.js', '.ts', '.tsx']
  },
  entry: {
    app: './index.tsx',
    vendor: [
      'react',
      'react-dom',
      'react-router-dom',
      'toastr',
      'lc-form-validation',
      'redux',
      'react-redux',
      'redux-thunk',
      'query-string',
      'js-cookie',
      'socket.io-client',
      'guid-typescript',
      'lodash',
      'html2canvas',
      'jspdf',
      'html-react-parser',
      '../node_modules/jquery/dist/jquery.min.js',
      '../node_modules/popper.js/dist/popper.min.js',
      '../node_modules/bootstrap/dist/js/bootstrap.min.js',
    ],
    vendorStyles: [
      '../node_modules/bootstrap/dist/css/bootstrap.css',
      '../node_modules/toastr/build/toastr.css',
      '../node_modules/linearicons/dist/web-font/style.css',
      '../node_modules/@fortawesome/fontawesome-free/css/all.min.css',
      '../src/css/sb-admin-2.min.css',
    ],
    appStyles: './css/site.css'
  },
  output: {
    path: path.join(basePath, 'public'),
    filename: '[name].js',
  },
  module: {
    rules: [
      {
        test: /\.ts[x]?$/,
        exclude: /node_modules/,
        loader: 'awesome-typescript-loader',
        options: {
          useBabel: true,
        },
      },
      {
        test: /\.css$/,
        use: [MiniCssExtractPlugin.loader, "css-loader"],
      },
      {
        test: /\.(png|jpg|gif|svg)$/i,
        loader: 'file-loader',
        options: {
          name: 'assets/images/[name].[ext]?[hash]'
        }
      },
      {
        test: /\.(ttf|woff|woff2|eot)$/,
        loader: 'file-loader',
        options: {
          name: 'assets/fonts/[name].[ext]?[hash]'
        }
      }
    ],
  },
  // For development https://webpack.js.org/configuration/devtool/#for-development
  devtool: 'inline-source-map',
  devServer: {
    host: process.env.HOST,
    port: process.env.PORT,
    noInfo: true,
    historyApiFallback: true,
    before: function (app, server) {
      app.use(session({
        secret: process.env.SESSION_SECRET_TOKEN,
        resave: false,
        saveUninitialized: true
      }));
      app.use(cookieParser());
      app.use(bodyParser.json());
      app.use(bodyParser.urlencoded({ extended: true }));
      app.use(cors({ origin: 'http://' + process.env.HOST + ':' + process.env.PORT }));
      app.use(function (err, req, res, next) {
        res.status(500).send('error occurred.');
      });
      app.use('/isync', isyncController);
      app.use('/accounts', accountController.router);
      app.use('/', marketController);
      app.use('/', othersController);
    }
  },
  plugins: [
    //Generate index.html in /dist => https://github.com/ampedandwired/html-webpack-plugin
    new HtmlWebpackPlugin({
      favicon: "images/favicon.ico",
      filename: 'index.html', //Name of file in ./dist/
      template: 'index.html', //Name of template in ./src
      hash: true,
    }),
    new MiniCssExtractPlugin({
      filename: "[name].css",
      chunkFilename: "[id].css"
    }),
    new webpack.ProvidePlugin({
      jQuery: 'jquery',
      $: 'jquery',
      jquery: 'jquery'
    })
  ],
};