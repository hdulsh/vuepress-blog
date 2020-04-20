---
title: vuepress 引入 iconfont.js 打包时报错 window is not defined
date: 2020-04-20
tags:
 - 
categories:
 - 
---

## 复现
在 enhanceApp.js 中直接引入 iconfont.js ，npm run docs:build 的时候会报 window is not defined 错误，查看 iconfont.js 看到在函数模块化后面传入了全局变量 window

## 原因
>[浏览器的 API 访问限制](https://v1.vuepress.vuejs.org/zh/guide/using-vue.html#浏览器的-api-访问限制)

当你在开发一个 VuePress 应用时，由于所有的页面在生成静态 HTML 时都需要通过 Node.js 服务端渲染，因此所有的 Vue 相关代码都应当遵循 编写通用代码 的要求。简而言之，请确保只在 `beforeMount` 或者 `mounted` 访问浏览器 / DOM 的 API  

如果你正在使用，或者需要展示一个对于 SSR 不怎么友好的组件（比如包含了自定义指令），你可以将它们包裹在内置的` <ClientOnly>` 组件中：
```js
<ClientOnly>
  <NonSSRFriendlyComponent/>
</ClientOnly>
```
请注意，这并不能解决一些组件或库在导入时就试图访问浏览器 API 的问题 —— 如果需要使用这样的组件或库，你需要在合适的生命周期钩子中动态导入它们：  
所以在需要使用iconfont的页面的`mounted`周期的时候import它
```js
   mounted () {
     import('../styles/iconfont.js').then(icon => {})
   },
```
或者在`enhanceApp.js`
```js
export default ({
  Vue, // VuePress 正在使用的 Vue 构造函数
  options, // 附加到根实例的一些选项
  router, // 当前应用的路由实例
  siteData, // 站点元数据
  isServer // 当前应用配置是处于 服务端渲染 或 客户端
}) => {
  // ...做一些其他的应用级别的优化
  if(!isServer){
    import('./styles/iconfont.js').then(module => {
      Vue.use(module)
    })    
  }
}
```
## 另一个问题
经过上述修改之后build没有问题，但是控制台会报错
`DOMException: Failed to execute 'appendChild' on 'Node': This node type does not support this method`  
看了下appendChild是在iconfont.js里  
我的代码中icon是用      `v-if="pageInfo.frontmatter.date`控制显示的，推测当页面Dom在还没有渲染完成的情况下，数据被插入到未知节点中，导致出现这种错误，改成`v-show`即可解决  
:::tip
vue框架中提供了v-if 和 v-show两个指令，用于控制页面不DOM结构的显性。  

相同点：均可以实现局部DOM的显示和隐藏  

不同点：显示和隐藏的原理不同。v-show隐藏元素的本质是给元素本省添加了display = none这个css属性，其实DOM结构仍存在于页面，可以通过F12查看DOM结构。v-if隐藏元素的本质是不加载DOM结构，不能通过F12查看DOM结构之后再v-if绑定的布尔变量为true时，才添加对应的DOM结构
:::
