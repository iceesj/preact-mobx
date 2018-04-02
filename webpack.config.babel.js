import path from 'path';
import webpack from 'webpack';
import px2rem from 'postcss-px2rem';
import autoprefixer from 'autoprefixer';
import HtmlWebpackPlugin from 'html-webpack-plugin';
import CopyWebpackPlugin from 'copy-webpack-plugin';
import CleanWebpackPlugin from 'clean-webpack-plugin';
import ReplacePlugin from 'replace-bundle-webpack-plugin';
import DashboardPlugin from 'webpack-dashboard/plugin';

const forBuild = process.env.NODE_ENV === "production";

const htmlTplPlugin = new HtmlWebpackPlugin({
  template: './index.ejs',
  title: '阿京妈直销平台',
  description: '阿京妈直销平台',
  minify: {
    collapseWhitespace: forBuild,
    minifyJS: forBuild,
    minifyCSS: forBuild,
    removeComments: forBuild
  }
});

const copyFilePlugin = new CopyWebpackPlugin([{
  from: './favicon.ico',
  to: './'
}, {
  from: './assets',
  to: './assets'
}]);

const cleanPlugin = new CleanWebpackPlugin(['build'], {
  root: path.resolve(__dirname),
  verbose: true,
  dry: false
});

const uglifyPlugin = new webpack.optimize.UglifyJsPlugin({
  output: {
    comments: false
  },
  compress: {
    warnings: !false
  }
});

const devConfig = {
  port: process.env.PORT || 8080,
  host: '0.0.0.0',
  // hot: true,
  // quiet: true,
  colors: true,
  compress: true,
  publicPath: '/',
  contentBase: './src',
  filename: 'app.js',
  historyApiFallback: true,
  disableHostCheck: true,
  proxy: {
    '/api-front': {
      target: 'http://front.bestfood520.com',
    },
    '/favicon.ico' : {
      target: 'http://front.bestfood520.com',
    }
  }
};

const hiddenErrorPlugin = new ReplacePlugin([{
  partten: /throw\s+(new\s+)?([a-zA-Z]+)?Error\s*\(/g,
  replacement: () => 'return;('
}]);

const rpx2px = new ReplacePlugin([{
  partten: /(\d)rpx/g,
  replacement: (a, b) => b + 'px'
}]);

const px2remOption = {
  plugins: () => {
    return [
      px2rem({
        remUnit: 20,
        remPrecision: 5
      }),
      autoprefixer
    ];
  }
};

const inlineCssloader = [{
  loader: "style-loader"
}, {
  loader: "css-loader",
  options: {
    module: true,
    localIdentName: '[local]-[hash:base64:6]'
  }
}, {
  loader: "postcss-loader",
  options: px2remOption
}, {
  loader: "resolve-url-loader",
  options: {
    sourceMap: true
  }
}, {
  loader: "less-loader"
}];

const extraCssloader = [{
  loader: "style-loader"
}, {
  loader: "css-loader"
}, {
  loader: "postcss-loader",
  options: px2remOption
}, {
  loader: "less-loader"
}];

const manifestPlugin = new webpack.optimize.CommonsChunkPlugin({names: ['manifest']});

const webpackPlugins = forBuild ?
  [
    cleanPlugin,
    copyFilePlugin,
    uglifyPlugin,
    hiddenErrorPlugin,
    rpx2px,
    htmlTplPlugin,
    manifestPlugin
  ] :
  [
    new DashboardPlugin(),
    rpx2px,
    htmlTplPlugin,
    manifestPlugin
  ];

module.exports = {
  context: path.resolve(__dirname, "src"),

  entry: {
    app: "./index.js"
  },

  output: {
    path: path.resolve(__dirname, "build"),
    publicPath: "/",
    filename: "dsstatic/[name].[chunkhash:6].js"
  },

  module: {
    rules: [{
      test: /\.jsx?$/,
      exclude: ["node_modules"],
      use: ['babel-loader']
    }, {
      test: /\.(less|css)$/,
      include: [path.resolve(__dirname, 'src/components')],
      use: inlineCssloader
    }, {}, {
      test: /\.(less|css)$/,
      exclude: [path.resolve(__dirname, 'src/components')],
      use: extraCssloader
    }, {
      test: /\.json$/,
      loader: 'json-loader'
    }, {
      test: /\.(xml|html|txt|md)$/,
      loader: 'raw-loader'
    }, {
      test: /\.(svg|woff2?|ttf|eot|jpe?g|png|gif)(\?.*)?$/i,
      use: {
        loader: 'url-loader',
        options: {
          limit: 5120,
          name: 'dsstatic/[sha512:hash:base64:12].[ext]'
        }
      }
    }]
  },

  resolve: {
    extensions: [
      '.jsx', '.js', '.json'
    ],
    modules: [
      path.resolve(__dirname, "src"),
      'node_modules'
    ],
    alias: {
      'react': 'preact-compat',
      'react-dom': 'preact-compat',
      'babel': 'babel-cli',
    }
  },

  plugins: webpackPlugins,

  devtool: forBuild ? 'hidden' : 'cheap-module-eval-source-map',

  target: "web",

  stats: {
    colors: true
  },

  devServer: devConfig
}
