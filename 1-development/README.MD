# webpack开发环境的搭建

## webpack安装与引入

生成包文件`package.json`
> `npm init`

安装`webpack`与`webpack-cli`(全局安装和开发环境安装)

> `cnpm i -g webpack webpack-cli`
> `cnpm i -D webpack webpack-cli`

## webpack配置

创建`webpack.config.js`文件，文件结构如下：

```js
module.exports={
    entry:'',
    output:{}
    module:{
        rules:[]
        }
    plugins:[],
    mode:'',
    ...
}
```

webpack配置有5块，分别是`entry`、`output`、`loader`、`plugin`、`mode`

- entry 配置入口起点文件
  - 字符串，配置起点js文件的路径
- output bundle输出的地址和命名
  - filename,字符串，输出的文件名
  - path,打包输出后的绝对路径，一般使用`resolve`的方法(nodejs)来获取

    ```js
    const {resolve}=require('path')//引入resolve
    resolve(__dirname,'build')//获取当前路径，并定义打包后的路径
    ```

- loader 非js文件的识别，类似翻译
  - 1、下载；2、使用
  - 使用方法：（需要利用`cnpm i -D xxx`来安装需要使用的插件）
    > `cnpm i -D style-loader css-loader less-loader url-loader html-loader file-loader`

    ```js
    module:{
        rules:[
            {
                test:/\.css$/,//利用正则表达式找到需要翻译的文件后缀
                //使用第三方插件（多个用use（数组），单个用loader（字符串））,按照执行顺序的倒序排列；
                use:['style-loader','css-loader']
            },
            {
                test:/\.less$/,
                //less文件需要单独安装less插件
                use:['style-loader','css-loader','less-loader']
            },
            {
                test:/\.(jpg|png|gif)$/,
                loader:'url-loader'//图片依赖于file-loader
                options:{
                    //小于8kb的图片，用base64进行压缩处理，减少对后端的请求次数，缓解后端压力
                    limit:8*1024,
                    //打包后的图片会单独生成hash值为文件名，添加该行可以缩短文件名的长度
                    //ext为原本的文件后缀
                    name:'[hash:10].[ext]',
                    //该loader用于处理直接使用的图片，不能解析html中引用的图片链接，
                    //为便于转化，需要将其es6模式关闭，用commonjs规范
                    esModule:false,
                    //定义打包后存放的文件夹名(不配置该行将生成在根目录)
                    outputPath:'imgs'
                }
            },
            {
                //html中引入的图片文件可以用这个翻译
                //由于是commonjs规范，所以需要关闭上面那个的esModule
                test:/\.html$/,
                loader:'html-loader'
            },
            {
                //除去上面文件后的所有其他文件
                exclude:/\.(css|less|jpg|gif|png|html|js)$/,
                loader:'file-loader',
                options:{
                    name:'[hash:10].[ext]',
                    outputPath:'others'
                }
            }
            ]
    }
    ```

- plugin 插件，用于复杂内容的压缩、优化等
  - 1、下载；2、引用；3、使用
  - html文件的打包需要写在该配置下面
    > `cnpm i -D html-webpack-plugin`

    ```js
    const HtmlWebpackPlugin=require('html-webpack-plugin')
    plugin:[
        new HtmlWebpackPlugin({
            //引入需要打包的html文件
            template:'./src/index.html'
        })
    ]
    ```

- mode 打包类型
  - `development`开发环境
  - `production`生产环境

## `devServer`开发服务器

用于自动化编译，需要安装`webpack-dev-server`
> `cnpm i -D webpack-dev-server`

```js
devServer:{
    contentBase:resolve(__dirname,'build'),//配置打包后的路径
    compress:true,//启动gzip压缩，提升效率
    open:true,//运行则打开浏览器
    port:3000,//配置服务器端口
}
```

打包方式

- webpack 直接输出到build文件夹
- npx webpack-dev-server 无输出，在内存中打包(用于开发,实现热加载)

## 总结

1. webpack可以处理js/json文件，不能处理css/img等文件，需要第三方插件支持；
2. 生产环境比开发环境多一个压缩js代码的功能，可以为线上部署节约空间；
3. webpack利用插件将ES6转译为浏览器能够识别的内容；

## 备注

使用webpack需要安装的东西

```js
//全局安装webpack
cnpm i -g webpack webpack-cli
//项目中使用webpack需要安装的内容
cnpm i -D webpack webpack-cli style-loader css-loader less-loader less url-loader file-loader html-loader html-webpack-plugin
```

## 结束

[前往下一节](../2-production/README.MD)
[返回首页](../README.MD)