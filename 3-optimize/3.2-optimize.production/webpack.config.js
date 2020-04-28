const { resolve } = require("path");
const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const OptimizeCssAssetsWebpackPlugin = require("optimize-css-assets-webpack-plugin");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const WorkboxWebpackPlugin = require("workbox-webpack-plugin");
const Webpack = require("webpack");
const AddAssetHtmlWebpackPlugin = require("add-asset-html-webpack-plugin");
const commonCss = [
  MiniCssExtractPlugin.loader,
  "css-loader",
  {
    loader: "postcss-loader",
    options: {
      ident: "postcss",
      plugins: () => [require("postcss-preset-env")()]
    }
  }
];
module.exports = {
  entry: "./src/js/index.js",
  output: {
    filename: "[name].[hash:8].js", //输出文件命名方法
    chunkFilename: "[name].[hash:8].js", //动态import文件名
    path: resolve(__dirname, "build")
  },
  module: {
    rules: [
      // {
      //   test: /\.js$/,
      //   exclude: /node_modules/,
      //   enforce: "pre",
      //   loader: "eslint-loader",
      //   options: {
      //     fix: true
      //   }
      // },
      {
        oneOf: [
          {
            test: /\.css$/,
            use: [...commonCss]
          },
          {
            test: /\.less$/,
            use: [...commonCss, "less-loader"]
          },
          {
            test: /\.(png|gif|jpg)$/,
            loader: "url-loader",
            options: {
              limit: 8 * 1024,
              name: "[hash:10].[ext]",
              esModule: false,
              outputPath: "imgs"
            }
          },
          {
            test: /\.html$/,
            loader: "html-loader"
          },

          {
            test: /\.js$/,
            exclude: /node_modules/,
            use: [
              { loader: "thread-loader", options: { workers: 2 } },
              {
                loader: "babel-loader",
                options: {
                  presets: [
                    [
                      "@babel/preset-env",
                      {
                        useBuiltIns: "usage",
                        corejs: "3",
                        targets: {
                          chrome: "60",
                          firefox: "50",
                          ie: "9"
                        }
                      }
                    ]
                  ],
                  cacheDirectory: true
                }
              }
            ]
          },
          {
            exclude: /\.(js|css|less|png|gif|jpg|html)$/,
            loader: "file-loader",
            options: {
              name: "[hash:10].[ext]"
            }
          }
        ]
      }
    ]
  },
  plugins: [
    new MiniCssExtractPlugin({
      filename: "css/[name].[hash:8].css"
    }),
    new OptimizeCssAssetsWebpackPlugin(),
    new HtmlWebpackPlugin({
      template: "./src/index.html",
      minify: {
        collapseWhitespace: true,
        removeComments: true
      }
    }),
    new WorkboxWebpackPlugin.GenerateSW({
      clientsClaim: true,
      skipWaiting: true
    }),
    new Webpack.DllReferencePlugin({
      manifest: resolve(__dirname, "dll/manifest.json")
    }),
    new AddAssetHtmlWebpackPlugin({
      filepath: resolve(__dirname, "dll/jquery.js")
    })
  ],
  mode: "production",
  // externals: {
  //   jquery: "jQuery"
  // }
};
