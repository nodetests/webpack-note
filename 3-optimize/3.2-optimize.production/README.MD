# 生产环境的优化配置

## `oneOf`

被oneOf包起来的loader，运行时只会匹配一个
所以不能有两个配置处理同一种文件类型存在；(js的语法检查和压缩必须取一个放在外面)

```js
    module:{
        rules:[
            {
                test:...
            }
            ,oneof:[...]
        ]
    }
```

## 缓存

### babel缓存

只需要在`babel-loader`的`options`中配置`cacheDirectory:true`

### 文件资源缓存

需要安装nodemon实现热加载
> `cnpm i -g nodemon`

在项目根目录创建`server.js`文件

```js
    const express=require('express')
    const app=express()
    app.use(express.static('build',{//用static中间件暴露build目录
        maxAge:1000*3600//文件在内存中缓存1个小时
    }))
    app.listen(3000)//服务器端口设置为3000
```

运行`nodemon server.js`启动服务器，此时修改任何样式和js后打包都不会使显示发生变化，只有`html`随着修改发生变化。
所以需要改变js和样式文件的文件名来使服务器显示发生变化，就得使用hash值给这些文件命名；
hash值又有三个类型：

- hash:每次webpack都会重新生成新的hash值(就算不修改也会导致hash变化，在这里不适用)
- chunkhash:根据每个chunk内容生成hash值（js与css都是来源于一个chunk--css由js引入，在这里也不适用）
- contenthash:根据文件内容生产hash值，不改变内容就不会更换

在输出文件名中引入`contenthash`值，每次打包会将修改了的文件会被新建，而未修改的文件被缓存在内存中，这样就能提升线上运行的速度。

## tree shaking 树摇

作用是去除无用代码，减小文件体积

- 必须使用ES6语法
- 模式必须为production

> 需要配置json文件中配置`side Effects`设置为false是指所有代码都没副作用
> 可能会干掉css/@babel/polyfill文件
> "side Effects":["*.css","*.less"]

## code split 代码分割

代码分割可以实现两种效果

- 分割代码，拆分为多个小js文件
- 按需下载

### 添加入口文件（多入口）

```js
entry:{
    main:"..."
    index:"..."
}
output: {
    path: path.resolve(__dirname, 'build'),
    filename: '[name].[hash:8].js',//输出文件命名方法
    chunkFilename: '[name].[hash:8].js',//动态import文件名(配置之后import中才能使用webpackChunkName)
},
```

一个入口会生成一个bandle，所以多个入口就会生成多个js文件
> 每次都需要修改，不灵活

### 设置optimization

在module.export中配置：

```js
    optimization:{//将从依赖中引用的代码单独打包为一个chunk输出
        splitChunks:{
            chunks:"all"//配合多入口可以自动分析有没有公共依赖，公共依赖只会打包一次
        }
    }
```

### js中使用`imoport`动态导入语法

动态导入可以将文件单独一个chunk输出，利用注释+`webpackChunkName`来给chunk输出重新命名

```js
import(/* webpackChunkName:name */'文件路径').then((res)=>{

}).catch((err)=>{

})
```

## 懒加载与预加载

- 正常加载：并行加载，同时加载多个js文件
- 预加载：其他资源加载完了，再加载（存在兼容性问题）
- 懒加载：触发事件后加载（按需加载）

### 懒加载

点击事件触发后再从服务器中获取js文件，这个方法就是懒加载
> eslint-loader不支持该方法，会报错，待解决

同样，使用`webpackChunkName`给chunk命名

```js
document.getElementById("btn").onclick = () => {
  import(/* webpackChunkName:name */ "./print").then(data => {
    // eslint-disable-next-line
    console.log(data);
  });
};
```

### 预加载

在/**/ 中添加`webpackPrefetch:true`即可触发预加载，手机端存在兼容性问题！

## PWA 渐进式网络开发应用程序

PWA可实现断网依然可以访问，案例：[淘宝网](https://www.taobao.com/)
将network 设置成offline，依然可以用本地缓存进行访问。
workbox--> workbox-webpack-plugin
> `cnpm i -D workbox-webpack-plugin`

plugins中配置如下：

```js
const WorkboxWebpackPlugin = require("workbox-webpack-plugin");
 new WorkboxWebpackPlugin.GenerateSW({
      clientsClaim: true,//帮助serviceworker快速启动
      skipWaiting: true//删除旧的serviceworker
    })
```

入口文件中注册serviceworker

```js
if ("serviceWorker" in navigator) {//eslint不认识navigator、window
  window.addEventListener("load", () => {
    navigator.serviceWorker
      .register("/service-worker.js")//webpack生成service-worker.js文件
      .then(() => {
        console.log("注册成功");
      })
      .catch(() => {
        console.log("注册失败");
      });
  });
}
```

eslint不认识navigator、window,需要json中添加`"env":{"browser":true}`

```js
 "eslintConfig": {
    "extends": "airbnb-base",
    "env":{"browser":true}//支持浏览器全局
  },
```

service-worker必须运行在服务器上，可以使用serve来本地实现
全局安装serve库
> `cnpm i -g serve`

```js
serve -s build //启动服务器，将build目录下的资源作为静态资源暴露除去
```

serviceWorker运行成功，可以离线访问。

## 多进程打包

多进程打包需要安装插件`thread-loader`
> `cnpm i -D thread-loader`

在babel-loader后面使用

```js
{
    loader: "thread-loader",//可直接引用，对象形式引入可以进行相关配置
    options: { workers: 2 }//配置workers代表进程数量，本例是2进程
    },
     {
         loader: "babel-loader",
         ...
         }
```

> 多进程启动大概需要600ms，进程通信也有其他开销，只有打包工作消耗长的才需要多进程打包

## externals 拒绝打包

设置externals可以拒绝第三方引用的库不进行打包，后期用CDN链接进入即可。
本例用`jquery`库来演示

```js
 externals: {
    jquery: "jQuery"
  }
```

可以在html中引用CDN链接的形势来获取库[BootCDN](https://www.bootcdn.cn/)

## dll动态链接库

需要配置`dll.js`来控制某些库的单独打包,其配置如下：

```js
const { resolve } = require("path");
const webpack = require("webpack");
module.exports = {
  entry: {
    jquery: ["jquery"]//最终要打包生成的[name]== ["jquery"]打包的库为jquery
  },
  output: {
    filename: "[name].js",
    path: resolve(__dirname, "dll"),
    library: "[name]_[hash]"//打包后对外暴露的库的名称
  },
  plugins: [
    new webpack.DllPlugin({//提供一个和打包后的库的映射
      name: "[name]_[hash]",
      path: resolve(__dirname, "dll/manifest.json")
    })
  ],
  mode: "production"
};
```

> 使用 `webpack --config dll.js` 对库进行打包

库打包完成后，在`webpack.config.js`中使用`webpack`的方法来获取之前打包的库名称，来终止对库的重复打包

```js
 new Webpack.DllReferencePlugin({
      manifest: resolve(__dirname, "dll/manifest.json")
    })
```

安装`add-asset-html-webpack-plugin`插件，来实现在`html`插入js代码；
> `cnpm i -D add-asset-html-webpack-plugin`

```js
  new AddAssetHtmlWebpackPlugin({
      filepath: resolve(__dirname, "dll/jquery.js")//之前在dll中打包的库
    })
```

## 本篇所安装插件

```js
cnpm i -g nodemon serve jquery
cnpm i -D workbox-webpack-plugin thread-loader add-asset-html-webpack-plugin
```

[前往上一篇](../3.1-optimize-development/README.MD)
[返回本节](../README.MD)
[返回首页](../../README.MD)
