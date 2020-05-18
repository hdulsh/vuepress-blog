---
title: Virtual DOM VNode
date: 2019-08-26
tags:
 - VUE
 - 虚拟DOM
 - VNode
 - Virtual DOM
categories:
 - VUE
sidebar: auto
---

![](https://resource.limeili.co/abstract/abstract%20(18).jpg)
<!-- more -->

## 什么是VNode

我们知道，render function 会被转化成 VNode 节点。Virtual DOM 其实就是一棵以 JavaScript 对象（VNode 节点）作为基础的树，用对象属性来描述节点，实际上它只是一层对真实 DOM 的抽象。最终可以通过一系列操作使这棵树映射到真实环境上。由于 Virtual DOM 是以 JavaScript 对象为基础而不依赖真实平台环境，所以使它具有了跨平台的能力，比如说浏览器平台、Weex、Node 等。

## 实现一个VNode

VNode 归根结底就是一个 JavaScript 对象，只要这个类的一些属性可以正确直观地描述清楚当前节点的信息即可。我们来实现一个简单的 `VNode` 类，加入一些基本属性，为了便于理解，我们先不考虑复杂的情况。
```js
class VNode {
    constructor (tag, data, children, text, elm) {
        /*当前节点的标签名*/
        this.tag = tag;
        /*当前节点的一些数据信息，比如props、attrs等数据*/
        this.data = data;
        /*当前节点的子节点，是一个数组*/
        this.children = children;
        /*当前节点的文本*/
        this.text = text;
        /*当前虚拟节点对应的真实dom节点*/
        this.elm = elm;
    }
}
```
比如我目前有这么一个 Vue 组件。

```js
<template>
  <span class="demo" v-show="isShow">
    This is a span.
  </span>
</template>

```

用 JavaScript 代码形式就是这样的。

```js
function render () {
    return new VNode(
        'span',
        {
            /* 指令集合数组 */
            directives: [
                {
                    /* v-show指令 */
                    rawName: 'v-show',
                    expression: 'isShow',
                    name: 'show',
                    value: true
                }
            ],
            /* 静态class */
            staticClass: 'demo'
        },
        [ new VNode(undefined, undefined, undefined, 'This is a span.') ]
    );
}

```

看看转换成 VNode 以后的情况。

```js
{
    tag: 'span',
    data: {
        /* 指令集合数组 */
        directives: [
            {
                /* v-show指令 */
                rawName: 'v-show',
                expression: 'isShow',
                name: 'show',
                value: true
            }
        ],
        /* 静态class */
        staticClass: 'demo'
    },
    text: undefined,
    children: [
        /* 子节点是一个文本VNode节点 */
        {
            tag: undefined,
            data: undefined,
            text: 'This is a span.',
            children: undefined
        }
    ]
}

```

然后我们可以将 VNode 进一步封装一下，可以实现一些产生常用 VNode 的方法。

*   创建一个空节点

```js
function createEmptyVNode () {
    const node = new VNode();
    node.text = '';
    return node;
}

```

*   创建一个文本节点

```js
function createTextVNode (val) {
  return new VNode(undefined, undefined, undefined, String(val));
}

```

*   克隆一个 VNode 节点

```js
function cloneVNode (node) {
    const cloneVnode = new VNode(
        node.tag,
        node.data,
        node.children,
        node.text,
        node.elm
    );
    return cloneVnode;
}

```

总的来说，VNode 就是一个 JavaScript 对象，用 JavaScript 对象的属性来描述当前节点的一些状态，用 VNode 节点的形式来模拟一棵 Virtual DOM 树。

## 源码创建VNode过程

### 初始化vue
我们在实例化一个 vue 实例，也即 new Vue( ) 时，实际上是执行 src/core/instance/index.js  中定义的 Function 函数。

```js
function Vue (options) {
  if (process.env.NODE_ENV !== 'production' &&
    !(this instanceof Vue)
  ) {
    warn('Vue is a constructor and should be called with the `new` keyword')
  }
  this._init(options)
}
```

复制代码通过查看 Vue 的 function，我们知道 Vue 只能通过 new 关键字初始化，然后调用 `this._init`方法，该方法在 src/core/instance/init.js 中定义。
```js  
  Vue.prototype._init = function (options?: Object) {
    const vm: Component = this
      
    // 省略一系列其它初始化的代码
      
    if (vm.$options.el) {
      console.log('vm.$options.el:',vm.$options.el);
      vm.$mount(vm.$options.el)
    }
  }
```
### Vue实例挂载

Vue 中是通过 $mount 实例方法去挂载 dom 的，下面我们通过分析 compiler 版本的 mount 实现，相关源码在目录 src/platforms/web/entry-runtime-with-compiler.js 文件中定义
```js
const mount = Vue.prototype.$mount
Vue.prototype.$mount = function (
  el?: string | Element,
  hydrating?: boolean
): Component {
  el = el && query(el)
  
   // 省略一系列初始化以及逻辑判断代码  
 
  return mount.call(this, el, hydrating)
}

```
我们发现最终还是调用用原先原型上的 $mount 方法挂载 ，原先原型上的 $mount 方法在 src/platforms/web/runtime/index.js 中定义 。
```js
Vue.prototype.$mount = function (
  el?: string | Element,
  hydrating?: boolean
): Component {
  el = el && inBrowser ? query(el) : undefined
  return mountComponent(this, el, hydrating)
}
```
我们发现$mount 方法实际上会去调用 mountComponent 方法，这个方法定义在 src/core/instance/lifecycle.js 文件中

```js
export function mountComponent (
  vm: Component,
  el: ?Element,
  hydrating?: boolean
): Component {
  vm.$el = el
  // 省略一系列其它代码
  let updateComponent
  /* istanbul ignore if */
  if (process.env.NODE_ENV !== 'production' && config.performance && mark) {
    updateComponent = () => {
      // 生成虚拟 vnode   
      const vnode = vm._render()
      // 更新 DOM
      vm._update(vnode, hydrating)
     
    }
  } else {
    updateComponent = () => {
      vm._update(vm._render(), hydrating)
    }
  }

  // 实例化一个渲染Watcher，在它的回调函数中会调用 updateComponent 方法  
  new Watcher(vm, updateComponent, noop, {
    before () {
      if (vm._isMounted && !vm._isDestroyed) {
        callHook(vm, 'beforeUpdate')
      }
    }
  }, true /* isRenderWatcher */)
  hydrating = false

  return vm
}
```
从上面的代码可以看到，mountComponent 核心就是先实例化一个渲染Watcher，在它的回调函数中会调用 updateComponent 方法，在此方法中调用 `vm._render` 方法先生成虚拟 Node，最终调用 `vm._update` 更新 DOM。

### 创建虚拟Node
Vue 的 `_render` 方法是实例的一个私有方法，它用来把实例渲染成一个虚拟 Node
```js
 Vue.prototype._render = function (): VNode {
    const vm: Component = this
    const { render, _parentVnode } = vm.$options
    let vnode
    try {
      // 省略一系列代码  
      currentRenderingInstance = vm
      // 调用 createElement 方法来返回 vnode
      vnode = render.call(vm._renderProxy, vm.$createElement)
    } catch (e) {
      handleError(e, vm, `render`){}
    }
    // set parent
    vnode.parent = _parentVnode
    console.log("vnode...:",vnode);
    return vnode
  }

```
Vue.js 利用 `_createElement` 方法创建 VNode

`_createElement 方法有 5 个参数，context 表示 VNode 的上下文环境，它是 Component 类型；tag表示标签，它可以是一个字符串，也可以是一个 Component；data 表示 VNode 的数据，它是一个 VNodeData 类型，可以在 flow/vnode.js 中找到它的定义；children 表示当前 VNode 的子节点，它是任意类型的，需要被规范为标准的 VNode 数组`

### 实例查看

```js
  var app = new Vue({
    el: '#app',
    render: function (createElement) {
      return createElement('div', {
        attrs: {
          id: 'app',
          class: "class_box"
        },
      }, this.message)
    },
    data: {
      message: 'Hello Vue!'
    }
  })

```
![](https://resource.limeili.co/image/201909060025.png)

## 更新视图
:point_right: [详情见](./diff及patch机制.md) :point_left:
