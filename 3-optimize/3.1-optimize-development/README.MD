# 开发环境的优化配置

## HMR(hot module replacement)

> 一个模块变化只会影响本模块的打包

在`devServer`的配置项中添加`hot:true`，即可开启HMR功能，

```js
    devServer: {
        contentBase: resolve(__dirname, "build"),
        compress: true,
        open: true,
        port: 3000,
        hot: true
    }
```

- 样式文件可以使用HMR功能
  - 此时当你修改css的样式时，devServer服务器将只打包css文件，不会运行其他文件的打包；
- js/html没有HMR功能
  - html文件可以在entry中添加html的文件地址使html文件实现HMR功能(可以但没必要，html发生变化则需要重新打包所有文件)
  - js文件在入口文件中利用module上面的hot属性来判断需不需要开启HMR功能（只能对非入口文件使用,修改入口文件将重新打包所有文件）

    ```js
    if(module.hot){
        //一旦module上有hot属性，则开启了HMR功能
        module.hot.accept('./print.js',function(){
            //监听到print.js发生变化，就会执行这个回调，其他模块将不会进行打包
            console.log('')
        })
    }
    ```

## `source-map`

提供源代码到构建后代码的映射
构建后代码出错将报错位置映射到源代码指定位置
配置方法是在`webpack.config.js`中添加`deltool`属性

```js
deltool:'source-map'
```

### 配置方法

> `[inline- | hidden- | eval- ][nosource-][cheap-[module-]]source-map`

- source-map `外联` 基础配置 错误代码准确信息和位置(外联会生成一个`.map`文件)
- inline- `内联` 效果同上，但是是将source-map代码内联（只生成一个source-map代码）
- hidden- `外联` 只显示错误原因，无错误地址
- eval- `内联` 效果同`inline`，但会生成hash值（每个都会单独生成source-map代码）
- nosource- 显示错误代码准确信息，但是没有任何源代码信息
- cheap- 显示指定行的错误,其他配置可以精确到行内

### 开发环境配置

运行速度：`eval` > `inline` > `cheap` > ...

调试速度：`source-map` > `cheap-module-source-map` > `cheap-source-map`

推荐配置：`eval-source-map`(vue与react内置该配置)|`eval-cheap-module-source-map`

### 生产环境配置

运行速度:内联最慢； `nosource`会全部隐藏，`hidden`会隐藏原代码

推荐配置：`source-map`(vue与react内置该配置)|`cheap-module-source-map`

[前往下一篇](../3.2-optimize.production/README.MD)
[返回本节](../README.MD)
[返回首页](../../README.MD)
