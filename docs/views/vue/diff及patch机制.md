---
title: diff及patch机制
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

![](https://resource.limeili.co/image/201909051851.jpg!imgabstract)
<!-- more -->



## 源码diff调用逻辑

Vue.js 源码实例化了一个 watcher，这个 ~ 被添加到了在模板当中所绑定变量的依赖当中，一旦 model 中的响应式的数据发生了变化，这些响应式的数据所维护的 dep 数组便会调用 dep.notify() 方法完成所有依赖遍历执行的工作，这包括视图的更新，即 updateComponent 方法的调用。

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
完成视图的更新工作事实上就是调用了`vm._update`方法，这个方法接收的第一个参数是刚生成的Vnode

```js
Vue.prototype._update = function (vnode: VNode, hydrating?: boolean) {
    const vm: Component = this
    const prevEl = vm.$el
    const prevVnode = vm._vnode
    const restoreActiveInstance = setActiveInstance(vm)
    vm._vnode = vnode
    if (!prevVnode) {
      // 第一个参数为真实的node节点，则为初始化
      vm.$el = vm.__patch__(vm.$el, vnode, hydrating, false /* removeOnly */)
    } else {
      // 如果需要diff的prevVnode存在，那么对prevVnode和vnode进行diff
      vm.$el = vm.__patch__(prevVnode, vnode)
    }
    restoreActiveInstance()
    // update __vue__ reference
    if (prevEl) {
      prevEl.__vue__ = null
    }
    if (vm.$el) {
      vm.$el.__vue__ = vm
    }
    // if parent is an HOC, update its $el as well
    if (vm.$vnode && vm.$parent && vm.$vnode === vm.$parent._vnode) {
      vm.$parent.$el = vm.$el
    }
  }
```
在这个方法当中最为关键的就是 vm.__patch__ 方法，这也是整个 virtual-dom 当中最为核心的方法，主要完成了prevVnode 和 vnode 的 diff 过程并根据需要操作的 vdom 节点打 patch，最后生成新的真实 dom 节点并完成视图的更新工作

## patch

### 跨平台

因为使用了 Virtual DOM 的原因，Vue.js具有了跨平台的能力，Virtual DOM 终归只是一些 JavaScript 对象罢了，那么最终是如何调用不同平台的 API 的呢？

这就需要依赖一层适配层了，将不同平台的 API 封装在内，以同样的接口对外提供
```js
const nodeOps = {
    setTextContent (text) {
        if (platform === 'weex') {
            node.parentNode.setAttr('value', text);
        } else if (platform === 'web') {
            node.textContent = text;
        }
    },
    parentNode () {
        //......
    },
    removeChild () {
        //......
    },
    nextSibling () {
        //......
    },
    insertBefore () {
        //......
    }
}

```
### api
这些API在下面 `patch` 的过程中会被用到，他们最终都会调用 `nodeOps` 中的相应函数来操作平台。

`insert` 用来在 `parent` 这个父节点下插入一个子节点，如果指定了 `ref` 则插入到 `ref` 这个子节点前面。

```js
function insert (parent, elm, ref) {
    if (parent) {
        if (ref) {
            if (ref.parentNode === parent) {
                nodeOps.insertBefore(parent, elm, ref);
            }
        } else {
            nodeOps.appendChild(parent, elm)
        }
    }
}

```

`createElm` 用来新建一个节点， `tag` 存在创建一个标签节点，否则创建一个文本节点。

```js

function createElm (vnode, parentElm, refElm) {
    if (vnode.tag) {
        insert(parentElm, nodeOps.createElement(vnode.tag), refElm);
    } else {
        insert(parentElm, nodeOps.createTextNode(vnode.text), refElm);
    }
}

```

`addVnodes` 用来批量调用 `createElm` 新建节点。

```js
function addVnodes (parentElm, refElm, vnodes, startIdx, endIdx) {
    for (; startIdx <= endIdx; ++startIdx) {
        createElm(vnodes[startIdx], parentElm, refElm);
    }
}

```

`removeNode` 用来移除一个节点。

```js
function removeNode (el) {
    const parent = nodeOps.parentNode(el);
    if (parent) {
        nodeOps.removeChild(parent, el);
    }
}

```

`removeVnodes` 会批量调用 `removeNode` 移除节点。

```js
function removeVnodes (parentElm, vnodes, startIdx, endIdx) {
    for (; startIdx <= endIdx; ++startIdx) {
        const ch = vnodes[startIdx]
        if (ch) {
            removeNode(ch.elm);
        }
    }
}

```

### patch

首先说一下 `patch` 的核心 diff 算法，我们用 diff 算法可以比对出两颗树的「差异」，我们来看一下，假设我们现在有如下两颗树，它们分别是新老 VNode 节点，这时候到了 `patch` 的过程，我们需要将他们进行比对。

![](https://resource.limeili.co/image/201909061139.png)

diff 算法是通过同层的树节点进行比较而非对树进行逐层搜索遍历的方式，所以时间复杂度只有 O(n)，是一种相当高效的算法，如下图。

![](https://resource.limeili.co/image/201909061140.png)

。

这张图中的相同颜色的方块中的节点会进行比对，比对得到「**差异**」后将这些「**差异**」更新到视图上。因为只进行同层级的比对，所以十分高效。

`patch` 的过程相当复杂，我们先用简单的代码来看一下。

```js
function patch (oldVnode, vnode, parentElm) {
    if (!oldVnode) {
        addVnodes(parentElm, null, vnode, 0, vnode.length - 1);
    } else if (!vnode) {
        removeVnodes(parentElm, oldVnode, 0, oldVnode.length - 1);
    } else {
        if (sameVnode(oldVNode, vnode)) {
            patchVnode(oldVNode, vnode);
        } else {
            removeVnodes(parentElm, oldVnode, 0, oldVnode.length - 1);
            addVnodes(parentElm, null, vnode, 0, vnode.length - 1);
        }
    }
}

```
因为 `patch` 的主要功能是比对两个 VNode 节点，将「差异」更新到视图上，所以入参有新老两个 VNode 以及父节点的 element

* `oldVnode`（老 VNode 节点）不存在的时候，相当于新的 VNode 替代原本没有的节点，所以直接用 `addVnodes` 将这些节点批量添加到 `parentElm` 上

* 在 `vnode`（新 VNode 节点）不存在的时候，相当于要把老的节点删除，所以直接使用 `removeVnodes` 进行批量的节点删除即可

* 当 oldVNode 与vnode都存在的时候，需要判断它们是否属于sameVnode（相同的节点）。如果是则进行patchVnode（比对 VNode ）操作，否则删除老节点，增加新节点。

### sameVnode
```js
function sameVnode () {
    return (
        a.key === b.key &&
        a.tag === b.tag &&
        a.isComment === b.isComment &&
        (!!a.data) === (!!b.data) &&
        sameInputType(a, b)
    )
}

function sameInputType (a, b) {
    if (a.tag !== 'input') return true
    let i
    const typeA = (i = a.data) && (i = i.attrs) && i.type
    const typeB = (i = b.data) && (i = i.attrs) && i.type
    return typeA === typeB
}

```
只有当 `key`、 `tag`、 `isComment`（是否为注释节点）、 `data`同时定义（或不定义），同时满足当标签类型为 input 的时候 type 相同

### patchVnode
```js
function patchVnode (oldVnode, vnode) {
    if (oldVnode === vnode) {
        return;
    }

    if (vnode.isStatic && oldVnode.isStatic && vnode.key === oldVnode.key) {
        vnode.elm = oldVnode.elm;
        vnode.componentInstance = oldVnode.componentInstance;
        return;
    }

    const elm = vnode.elm = oldVnode.elm;
    const oldCh = oldVnode.children;
    const ch = vnode.children;

    if (vnode.text) {
        nodeOps.setTextContent(elm, vnode.text);
    } else {
        if (oldCh && ch && (oldCh !== ch)) {
            updateChildren(elm, oldCh, ch);
        } else if (ch) {
            if (oldVnode.text) nodeOps.setTextContent(elm, '');
            addVnodes(elm, null, ch, 0, ch.length - 1);
        } else if (oldCh) {
            removeVnodes(elm, oldCh, 0, oldCh.length - 1)
        } else if (oldVnode.text) {
            nodeOps.setTextContent(elm, '')
        }
    }
}

```
* 首先在新老 VNode 节点相同的情况下，就不需要做任何改变了，直接 return 掉

* 在当新老 VNode 节点都是 isStatic（静态的），并且 key 相同时，只要将 componentInstance 与 elm 从老 VNode 节点“拿过来”即可。这里的 isStatic 也就是前面提到过的「编译」的时候会将静态节点标记出来，这样就可以跳过比对的过程。

* 接下来，当新 VNode 节点是文本节点的时候，直接用 `setTextContent` 来设置 text，这里的 `nodeOps` 是一个适配层，根据不同平台提供不同的操作平台 DOM 的方法，实现跨平台。

* 当新 VNode 节点是非文本节点当时候，需要分几种情况

1. `oldCh` 与 `ch` 都存在且不相同时，使用 `updateChildren`函数来更新子节点，这个后面重点讲。
2. 如果只有 `ch` 存在的时候，如果老节点是文本节点则先将节点的文本清除，然后将 `ch` 批量插入插入到节点elm下
3. 同理当只有 `oldch` 存在时，说明需要将老节点通过 `removeVnodes` 全部清除。
4. 最后一种情况是当只有老节点是文本节点的时候，清除其节点文本内容。

### updateChildren

`function updateChildren (parentElm, oldCh, newCh)` oldCh newCh 过程中位置不会变化 ，真正操作的是parentElm

首先我们定义 oldStartIdx、newStartIdx、oldEndIdx 以及 newEndIdx 分别是新老两个 VNode 的两边的索引，同时 oldStartVnode、newStartVnode、oldEndVnode 以及 newEndVnode 分别指向这几个索引对应的 VNode 节点。

![](https://user-gold-cdn.xitu.io/2018/1/2/160b707df4902029?w=885&h=397&f=jpeg&s=2938)

接下来是一个 `while` 循环，在这过程中，`oldStartIdx`、`newStartIdx`、`oldEndIdx` 以及 `newEndIdx` 会逐渐向中间靠拢。

```js
while (oldStartIdx <= oldEndIdx && newStartIdx <= newEndIdx) 

```

![](https://user-gold-cdn.xitu.io/2018/1/2/160b70ecf5967f0a?w=864&h=428&f=png&s=30471)

接下来这一块，是将 oldStartIdx、newStartIdx、oldEndIdx 以及 newEndIdx 两两比对的过程，一共会出现 `2*2=4` 种情况

1. 首先是 oldStartVnode 与 newStartVnode 符合 sameVnode 时，说明老 VNode 节点的头部与新 VNode 节点的头部是相同的 VNode 节点，直接进行 patchVnode，同时 oldStartIdx 与 newStartIdx 向后移动一位

2. 其次是 oldEndVnode 与 newEndVnode 符合 sameVnode，也就是两个 VNode 的结尾是相同的 VNode，同样进行 patchVnode 操作并将 oldEndVnode 与 newEndVnode 向前移动一位。

3. 先是 oldStartVnode 与 newEndVnode 符合 sameVnode 的时候，也就是老 VNode 节点的头部与新 VNode 节点的尾部是同一节点的时候，将 oldStartVnode.elm 这个节点直接移动到 oldEndVnode.elm 这个节点的后面即可。然后 oldStartIdx 向后移动一位，newEndIdx 向前移动一位。

4. 同理，oldEndVnode 与 newStartVnode 符合 sameVnode 时，也就是老 VNode 节点的尾部与新 VNode 节点的头部是同一节点的时候，将 oldEndVnode.elm 插入到 oldStartVnode.elm 前面。同样的，oldEndIdx 向前移动一位，newStartIdx 向后移动一位。

5. 当以上情况都不符合的时候
oldKeyToIdx 是一个map，其中key就是常在for循环中写的v-bind:key的值，value 对应的就是当前vnode,也就是可以通过唯一的key，在map中找到对应的vnode
我们可以根据某一个 key 的值，快速地从 `oldKeyToIdx`（`createKeyToOldIdx` 的返回值）中获取相同 key 的节点的索引 `idxInOld`，然后找到相同的节点。

如果没有找到相同的节点，则通过 `createElm` 创建一个新节点，并将 `newStartIdx` 向后移动一位。

否则如果找到了节点，同时它符合 sameVnode，则将这两个节点进行 patchVnode，将该位置的老节点赋值 undefined（之后如果还有新节点与该节点key相同可以检测出来提示已有重复的 key ），同时将 newStartVnode.elm 插入到 oldStartVnode.elm 的前面。同理，newStartIdx 往后移动一位。
如果不符合 sameVnode，只能创建一个新节点插入到 parentElm 的子节点中，newStartIdx 往后移动一位

6. 最后一步就很容易啦，当 while 循环结束以后，如果 oldStartIdx > oldEndIdx，说明老节点比对完了，但是新节点还有多的，需要将新节点插入到真实 DOM 中去，调用 addVnodes 将这些节点插入即可。
同理，如果满足 newStartIdx > newEndIdx 条件，说明新节点比对完了，老节点还有多，将这些无用的老节点通过 removeVnodes 批量删除即可。


https://www.jianshu.com/p/c90850991026
https://github.com/aooy/blog/issues/2