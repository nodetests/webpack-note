# webpack 的优化配置

webpack的优化需要区分开发环境和生产环境

## 开发环境的优化配置

1. 优化打包速度
2. 优化代码调试

### 主要实现方式

1. `HMR`模块热替换
2. `source-map`代码映射

[详细讲解](../3-optimize/3.1-optimize-development/README.MD)

## 生产环境的优化配置

1. `oneOf`单独匹配loader
2. 缓存
   1. `babel`缓存
   2. 文件资源缓存
3. `tree shaking`树摇-去除无用代码
4. `code split`代码分割
5. 懒加载与预加载
6. `PWA`渐进式网络开发应用程序(可离线访问)
7. 多进程打包
8. `externals`拒绝第三方库打包
9. `dll`动态链接库

[详细讲解](../3-optimize/3.2-optimize.production/README.MD)