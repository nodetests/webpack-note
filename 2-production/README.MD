# webpack生产环境配置

webpack默认打包会将所有css文件打包到一个js之中，这样会导致页面出现闪屏的现象，并且代码没有被压缩，没有检查兼容性问题。

## 合理配置的优点

1. 分离出css文件，有效防止页面闪屏的出现；
2. 代码压缩，减少了文件体积，页面加载更快；
3. 配置中对代码进行兼容性处理，使多种浏览器都能兼容。

## 配置过程

`entry`与`output`跟上一节开发环境的配置相同；
本文主要针对css的分离-兼容处理-压缩、js的语法检查-兼容处理-压缩、html的压缩进行讲解

### 配置css

- css的分离
  需要使用的库`mini-css-extract-plugin`;在use中，用该库的`loader`取代`style-loader`
  > `cnpm i -D mini-css-extract-plugin`

  由于less也需要使用该方法进行分离，所以可以利用js的复用方法，用变量`commonCss`将相同的配置部分保存下来

  ```js
  const MiniCssExtractPlugin=require("mini-css-extract-plugin")
    const commonCss = [
      MiniCssExtractPlugin.loader,
      ...
      ];//用commonCss保存css与less的相同配置
    module: {
        rules: [
            {
                test: /\.css$/,
                use: [...commonCss]//直接用...展开进行引用
            },
      ...
        ]}
  ```

- css的兼容性处理
  css的兼容性处理需要使用`postcss`，具体需要安装`postcss-loader`与`postcss-preset-env`
  > `cnpm i -D postcss-loader postcss-preset-env`

  安装之后可以在commonCss中使用下面的配置（注意：由于执行循序是从后向前，所以less文件处理的循序应该是`less-loader`-->`postcss-loader`-->`MiniCssExtractPlugin.loader`*排列循序与执行循序相反*）
  
  ```js
    {
        loader: "postcss-loader",
        options: {
            ident: "postcss",
            plugins: () => [require("postcss-preset-env")()]
        }
    }
  ```

  直接将css分离时使用的`MiniCssExtractPlugin`在plugins里面引用;

  ```js
    plugins:[
        new MiniCssExtractPlugin();
    ]
  ```

  除了引入`postcss-loader`以外，还需要在`package.json`中配置[browserslist](https://github.com/browserslist/browserslist)

  ```js
    "browserslit": {
        "development": [
            "last 1 chrome version",
            "last 1 firefox version",
            "last 1 safari version"
        ],
        "production": [
            ">0.2%",
            "not-dead"
        ]
  },
  ```

- css的压缩
  
  css压缩需要使用`optimize-css-assets-webpack-plugin`
  > `cnpm i -D optimize-css-assets-webpack-plugin`

  ```js
  const OptimizeCssAssetsWebpackPlugin=require('optimize-css-assets-webpack-plugin')
    plugins:[
        new OptimizeCssAssetsWebpackPlugin();//用new构建之后就能直接运行
    ]
  ```

### js的配置

- js的语法检查
  js语法检查本文使用的是eslint的airbnb方案
  需要安装的库有`eslint`与`eslint-loader`
  > `cnpm i -D eslint eslint-loader`
  
  rules中配置如下

  ```js
  {
      text:/\.js$/,
      exclude:/node_modules/,//排除掉依赖中的js文件
      loader:'eslint-loader',
      options:{
          fix:true//激活fix，可以自动修复语法错误
      }
  }
  ```

  配置airbnb方案还需要安装`eslint-plugin-import`、`eslint-config--airbnb-base`(必须是base的，原版本是react的)
  > `cnpm i -D eslint-plugin-import eslint-config--airbnb-base`

  需要在`package.json`中配置`eslintConfig`

  ```js
    "eslintConfig": {
    "extends": "airbnb-base"
  },
  ```

  > `//eslint-disable-next-line` 可以忽略下一行的eslint检查（主要针对console）

- js兼容性处理
  需要安装`babel-loader`、`@babel/preset-env`与babel的核心`@babel/core`
  > `cnpm i -D babel-loader @babel/preset-env @babel/core`
  兼容性处理有三种方式
  1. 基本兼容性处理
    直接使用`babel-loader`,能够实现简单的js兼容性处理，无法对promise这种es6的语法进行转换

     ```js
     {
         test: /\.js$/,
         exclude: /node_modules/,
         loader: "babel-loader",
         options: {
             presets: ["@babel/preset-env"],
             }
     }
     ```

  2. 全局兼容性处理
     安装并在js的入口文件中引入`@babel/polyfill`
     > `cnpm i -D @babel/polyfill`

     该方法可以实现所有ES6的语法转换，但是其中还包括了polyfill的包文件，打包出来的体积较大。

  3. 按需兼容性处理
     直接识别js中的语法进行按需转换
     需要安装`core-js`（-D安装要报错，-S安装就能运行）
     > `cnpm i -S core-js`

     配置按需加载

     ```js
      test: /\.js$/,
         exclude: /node_modules/,
         loader: "babel-loader",
         options: {
             presets: [
                 ["@babel/preset-env",
                 {
                     useBuiltIns:'usage',
                     corejs:'3',//引入corejs的版本号
                     targets:{//配置兼容的浏览器版本号
                         chorme:'60'
                         ...
                     }
                 }
                 ]
                ],
             }
     ```

> 由于语法检查要在兼容性处理之前，所以在语法检查的地方添加`enforce:'pre'`来使其优先执行。

- js的压缩
  生产环境默认自动压缩js代码，
  只需要将`mode`设置为`production`就行。

### 配置html

`html`文件不需要检查兼容性等问题，直接在`HtmlWebpackPlugin`中添加`minify`就行；

```js
     minify: {
        collapseWhitespace: true,//去除空格
        removeComments: true//去除注释
      }
```

## 备注

```js
//dependencies安装core-js
cnpm i -S core-js
//项目中使用webpack需要安装的内容
cnpm i -D mini-css-extract-plugin postcss-loader postcss-preset-env optimize-css-assets-webpack-plugin eslint eslint-loader eslint-plugin-import eslint-config--airbnb-base babel-loader @babel/preset-env @babel/core @babel/polyfill
```

## 结束

[返回上一节](../1-development/README.MD)
[前往下一节](../3-optimize/README.MD)
[返回首页](../README.MD)
