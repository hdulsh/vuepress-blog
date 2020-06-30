---
title: render渲染函数和vue渲染机制
date: 2019-08-26
tags:
 - VUE
 - render
 - 渲染函数
categories:
 - VUE
sidebar: auto
---
![](https://resource.limeili.co/abstract/abstract%20(17).jpg)
<!-- more -->

## 一些基本概念
![](https://resource.limeili.co/image/201909051851.jpg)
模板通过parse解析生成AST抽象语法树，再由AST编译生成render渲染函数，渲染函数被调用时就会渲染并返回一个VNode即Virtual DOM, Diff和Patch后生成新的UI

模板：Vue的模板基于纯HTML，基于Vue的模板语法，我们可以比较方便地声明数据和UI的关系。

AST：AST是Abstract Syntax Tree的简称，Vue使用HTML的Parser将HTML模板解析为AST，并且对AST进行一些优化的标记处理，提取最大的静态树，方便Virtual DOM时直接跳过Diff。

渲染函数：渲染函数是用来生成Virtual DOM的。Vue推荐使用模板来构建我们的应用界面，在底层实现中Vue会将模板编译成渲染函数，当然我们也可以不写模板，直接写渲染函数，以获得更好的控制 

Virtual DOM：虚拟DOM树，Vue的Virtual DOM 

Patching算法是基于Snabbdom的实现，并在些基础上作了很多的调整和改进。

Watcher：每个Vue组件都有一个对应的watcher，这个watcher将会在组件render的时候收集组件所依赖的数据，并在依赖有更新的时候，触发组件重新渲染。你根本不需要写shouldComponentUpdate，Vue会自动优化并更新要更新的UI。

上图中，render函数可以作为一道分割线，render函数的左边可以称之为编译期，将Vue的模板转换为渲染函数。render函数的右边是Vue的运行时，主要是基于渲染函数生成Virtual DOM树，Diff和Patch。

**模板 → 渲染函数 → 虚拟DOM树 → 真实DOM 的一个过程**
![](https://www.w3cplus.com/sites/default/files/blogs/2018/1804/vue-render-3.png)

createElement 到底会返回什么呢？其实不是一个实际的 DOM 元素。它更准确的名字可能是 createNodeDescription ，因为它所包含的信息会告诉 Vue 页面上需要渲染什么样的节点，及其子节点。我们把这样的节点描述为“虚拟节点 (Virtual Node)”，也常简写它为“VNode”。“虚拟 DOM”是我们对由 Vue 组件树建立起来的整个 VNode 树的称呼。

## VUE渲染机制
`vm.$mount`
![](https://www.w3cplus.com/sites/default/files/blogs/2018/1804/vue-render-4.png)
上图展示的是独立构建时的一个渲染流程图

![](https://resource.limeili.co/image/201909052051.webp!png)

在创建一个vue实例的时候(var vm = new Vue(options))。Vue的构造函数将自动运行 this._
init（启动函数）
```js
// Vue.prototype._init
    ...
    initLifecycle(vm);
    initEvents(vm);
    callHook(vm, 'beforeCreate');
    initState(vm);
    callHook(vm, 'created');
    if (vm.$options.el) {
    vm.$mount(vm.$options.el);
  }
```

将实例挂载到dom上，至此启动函数完成。
若Vue实例上面没有el属性，则生命周期执行到这就挂起了，直到手动去执行vm.mount(el)，生命周期才会继续执行
![](https://resource.limeili.co/image/201909052052.webp!png)


* 独立构建 ：包含模板编译器，渲染过程 `HTML字符串 → render函数 → VNode → 真实DOM节点`
* 运行时构建 ：不包含模板编译器，渲染过程 `render函数 → VNode → 真实DOM节点`

运行时构建的包，会比独立构建少一个模板编译器。在 $mount 函数上也不同。而 $mount 方法又是整个渲染过程的起始点。用一张流程图来说明：
![](https://www.w3cplus.com/sites/default/files/blogs/2018/1804/vue-render-5.png)
在渲染过程中，提供了三种渲染模式，`自定义 render 函数`、 `emplate `、` el `均可以渲染页面，也就是对应我们使用Vue时，三种写法：

**自定义render函数**
```js
Vue.component('anchored-heading', {
    render: function (createElement) {
        return createElement (
            'h' + this.level,   // tag name标签名称
            this.$slots.default // 子组件中的阵列
        )
    },
    props: {
        level: {
            type: Number,
            required: true
        }
    }
})
```

**template写法**
```js
let app = new Vue({
    template: `<div>{{ msg }}</div>`,
    data () {
        return {
            msg: ''
        }
    }
})
```

**el写法**
```js
let app = new Vue({
    el: '#app',
    data () {
        return {
            msg: 'Hello Vue!'
        }
    }
})
```

这三种渲染模式最终都是要得到 render 函数。只不过用户自定义的 render 函数省去了程序分析的过程，等同于处理过的 render 函数，而普通的 template 或者 el 只是字符串，需要解析成AST，再将AST转化为 render 函数。

**记住一点，无论哪种方法，都要得到 render 函数**

## createElement
**第一个参数： {String | Object | Function}**
```js
<div id="app">
    <custom-element></custom-element>
</div>
Vue.component('custom-element', {
    render: function (createElement) {
        return createElement('div')
    }
})
let app = new Vue({
    el: '#app'
})
```
```js
Vue.component('custom-element', {
    render: function (createElement) {
        return createElement({
            template: `<div>Hello Vue!</div>`
        })
    }
})
```
```js
Vue.component('custom-element', {
    render: function (createElement) {
        var eleFun = function () {
            return {
                template: `<div>Hello Vue!</div>`
            }
        }
        return createElement(eleFun())
    }
})
```

**第二个参数： {Object}**
```js
<div id="app">
    <custom-element></custom-element>
</div>
Vue.component('custom-element', {
    render: function (createElement) {
        var self = this
        // 第一个参数是一个简单的HTML标签字符 “必选”
        // 第二个参数是一个包含模板相关属性的数据对象 “可选”
        return createElement('div', {
            'class': {
                foo: true,
                bar: false
            },
            style: {
                color: 'red',
                fontSize: '14px'
            },
            attrs: {
                id: 'boo'
            },
            domProps: {
                innerHTML: 'Hello Vue!'
            }
        })
    }
})
let app = new Vue({
    el: '#app'
})
```
![](https://www.w3cplus.com/sites/default/files/blogs/2018/1804/vue-render-8.png)


**第三个参数： {String | Array}**
```js
<div id="app">
    <custom-element></custom-element>
</div>
Vue.component('custom-element', {
    render: function (createElement) {
        var self = this
        return createElement(
            'div', // 第一个参数是一个简单的HTML标签字符 “必选”
            {
                class: {
                    title: true
                },
                style: {
                    border: '1px solid',
                    padding: '10px'
                }
            }, // 第二个参数是一个包含模板相关属性的数据对象 “可选”
            [
                createElement('h1', 'Hello Vue!'),
                createElement('p', '开始学习Vue!')
            ] // 第三个参数是传了多个子元素的一个数组 “可选”
        )
    }
})
let app = new Vue({
    el: '#app'
})
```
![](https://www.w3cplus.com/sites/default/files/blogs/2018/1804/vue-render-9.png)

## 总结
回过头来看，Vue中的渲染核心关键的几步流程还是非常清晰的：

* new Vue ，执行初始化
* 挂载 $mount 方法，通过自定义 render 方法、 template 、 el 等生成 render 函数
* 通过 Watcher 监听数据的变化
* 当数据发生变化时， render 函数执行生成VNode对象
* 通过 patch 方法，对比新旧VNode对象，通过DOM Diff算法，添加、修改、删除真正的DOM元素
* 至此，整个 new Vue 的渲染过程完毕。