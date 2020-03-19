---
title: VUE双向绑定原理
date: 2019-08-26
tags:
 - VUE
 - 原理
 - 双向绑定
 - 响应式
 - MVVM
 - 数据劫持
 - 发布订阅
categories:
 - VUE
sidebar: auto
---

![](https://blog-1257601889.cos.ap-shanghai.myqcloud.com/vue/vue-mvvm-jiagou.png)
<!-- more -->

## MVVM

MVVM是Model-View-ViewModel的简写，即模型-视图-视图模型。
Model模型层负责处理业务逻辑及服务端的交互，指的是后端传递的数据，
View视图层指的是所看到的页面
ViewModel是MVVM模式的核心，它是连接View和Model的桥梁它有两个方向：
一是将Model转化成View，即将后端传递的数据转化成所看到的页面，实现的方式是「**数据绑定**」
二是将View转化成Model，即将所看到的页面转化成后端的数据，实现的方式是 「**DOM事件监听**」。这两个方向都实现的，我们称之为「**数据的双向绑定**」

总结：在MVVM的框架下视图和模型是不能直接通信的，它们通过ViewModel来通信，当数据发生变化，ViewModel能够监听到数据的这种变化，然后通知到对应的视图做自动更新，而当用户操作视图，ViewModel也能监听到视图的变化，然后通知数据做改动，这实际上就实现了数据的双向绑定。


## VUE实现

「**数据劫持**」 + 「**发布者-订阅者模式**」 

首先要对数据进行劫持监听，所以我们需要设置一个监听器Observer，用来监听所有属性。如果属性发上变化了，就需要告诉订阅者Watcher看是否需要更新。因为订阅者是有很多个，所以我们需要有一个消息订阅器Dep来专门收集这些订阅者，然后在监听器Observer和订阅者Watcher之间进行统一管理的。接着，我们还需要有一个指令解析器Compile，对每个节点元素进行扫描和解析，将相关指令对应初始化成一个订阅者Watcher，并替换模板数据或者绑定相应的函数，此时当订阅者Watcher接收到相应属性的变化，就会执行对应的更新函数，从而更新视图。因此接下去我们执行以下3个步骤，实现数据的双向绑定

### Observe

实现一个监听器Observe劫持并监听所有属性，每当数据变化通知订阅者Watcher
核心就是`Object.defineProperty()`
遍历obj所有的key，如果obj[key]也是对象的话，需要递归子属性
```js
function defineReactive(obj, key, val) {
    observe(val); // 递归遍历所有子属性
    let dep = new Dep()
    Object.defineProperty(obj, key, {
        enumerable: true,
        configurable: true,
        get: function() {
            return val;
        },
        set: function(newVal) {
            val = newVal;
            console.log('属性' + key + '已经被监听了，现在值为：“' + newVal.toString() + '”');
        }
    });
}
 
function observe(obj) {
    if (!obj || typeof obj !== 'object') {
        return;
    }
    Object.keys(obj).forEach(function(key) {
        defineReactive(obj, key, obj[key]);
    });
};
```

### Dep

实现一个消息订阅管理器Dep，主要负责收集订阅者，在Observe和Watcher之间统一管理
```js
 get: function() {
            if (Dep.target) {
                dep.addSub(Dep.target) // 在这里添加一个订阅者
            }
            return val
        },
        set: function(newVal) {
            if (val === newVal) {
                return
            }
            val = newVal
            dep.notify(); // 如果数据变化，通知所有订阅者
        }
```

```js
class Dep () {
   constructor() {this.subs = [] } 
   addSub(sub) {
        this.subs.push(sub);
   }
   notify() {
        this.subs.forEach(function(sub) {
            sub.update();
        })
    }
}

Dep.target = null;
```

### Watcher

实现一个订阅者Watcher接收属性的变化通知并执行相应的函数更新视图
我们已经知道监听器Observer是在get函数执行了添加订阅者Wather的操作的，所以我们只要在订阅者Watcher初始化的时候出发对应的get函数去执行添加订阅者操作即可，
那要如何触发get的函数，再简单不过了，只要获取对应的属性值就可以触发了，核心原因就是因为我们使用了Object.defineProperty( )进行数据监听。
这里还有一个细节点需要处理，我们只要在订阅者Watcher初始化的时候才需要添加订阅者，所以需要做一个判断操作，因此可以在订阅器上做一下手脚：
在Dep.target上缓存下订阅者，添加成功后再将其去掉就可以了

```js
function Watcher(vm, exp, cb) {
    this.cb = cb;
    this.vm = vm;
    this.exp = exp;
    this.value = this.get();  // 将自己添加到订阅器的操作 触发get
}
 
Watcher.prototype = {
    update: function() {
        this.run();
    },
    run: function() {
        var value = this.vm.data[this.exp];
        var oldVal = this.value;
        if (value !== oldVal) {
            this.value = value;
            this.cb.call(this.vm, value, oldVal);
        }
    },
    get: function() {
        Dep.target = this;  // 缓存自己
        var value = this.vm.data[this.exp]  // 强制执行监听器里的get函数
        Dep.target = null;  // 释放自己
        return value;
    }
}
````

### Compile
实现一个解析器，主要作用是解析模板指令，将模板中的变量替换成数据，然后初始化渲染页面视图，并将每个指令对应节点绑定更新函数，实例化订阅者，一旦数据变动，收到通知更新视图
1. 获取元素节点提取指令或模板
`isElemenTNode`递归条件，是否是元素节点nodeType == 1
为了解析模板，首先需要获取到dom元素，然后对含有dom元素上含有指令的节点进行处理，因此这个环节需要对dom操作比较频繁，所有可以先建一个fragment片段，将需要解析的dom节点存入fragment片段里再进行处理，接下来需要遍历各个节点，对含有相关指定的节点进行特殊处理

2. 分类编译指令的方法compileElement和编译文本的方法compileText
里面会执行CompileUtil()指令处理集合 
```js
var compileUtil = {
  // 解析: v-text/{{}}
  text: function (node, vm, exp) {
    this.bind(node, vm, exp, 'text');
  },
  // 解析: v-html
  html: function (node, vm, exp) {
    this.bind(node, vm, exp, 'html');
  },

  // 解析: v-model
  model: function (node, vm, exp) {
    this.bind(node, vm, exp, 'model');

    var me = this,
      val = this._getVMVal(vm, exp);
    node.addEventListener('input', function (e) {
      var newValue = e.target.value;
      if (val === newValue) {
        return;
      }

      me._setVMVal(vm, exp, newValue);
      val = newValue;
    });
  },

  // 解析: v-class
  class: function (node, vm, exp) {
    this.bind(node, vm, exp, 'class');
  },

  // 真正用于解析指令的方法
  bind: function (node, vm, exp, dir) {
    /*实现初始化显示*/
    // 根据指令名(text)得到对应的更新节点函数
    // 取到一个object的属性，有2个方法，一个是obj. 一个是obj[]
    // 当我们要取得属性是一个变量的时候，使用obj[]
    var updaterFn = updater[dir + 'Updater'];
    // 如果存在调用来更新节点
    updaterFn && updaterFn(node, this._getVMVal(vm, exp));

    // 创建表达式对应的watcher对象
    new Watcher(vm, exp, function (value, oldValue) {/*更新界面*/
      // 当对应的属性值发生了变化时, 自动调用, 更新对应的节点
      updaterFn && updaterFn(node, value, oldValue);
    });
  }
```
compileutil里有`bind`
1. 第一次初始化视图
2. 实例化订阅者
3. 属性变化执行此函数

## 总结

通过Observe监听自己model数据的变化，通过Compile解析模板指令，最终利用Watcher达旗Observe和Compile之间的桥梁

![](https://blog-1257601889.cos.ap-shanghai.myqcloud.com/vue/vue-mvvm-jiagou.png)

当执行 `new Vue()` 时，`Vue` 就进入了初始化阶段，一方面 `Vue` 会遍历 `dat`a 选项中的属性，并用 `Object.defineProperty` 将它们转为 `getter/setter`，实现数据变化监听功能；另一方面，`Vue` 的指令编译器 `Compile` 对元素节点的指令进行扫描和解析，初始化视图，并订阅 `Watcher` 来更新视图， 此时 `Wather` 会将自己添加到消息订阅器中`(Dep)`,初始化完毕。

当数据发生变化时，`Observer` 中的 `setter` 方法被触发，`setter` 会立即调用 `Dep.notify()`，`Dep` 开始遍历所有的订阅者，并调用订阅者的 `update `方法，订阅者收到通知后对视图进行相应的更新。

## VUE3.0 用proxy

Vue3 将使用 ES6的`Proxy` 作为其观察者机制，取代之前使用的`Object.defineProperty` 修改数组或者给对象新增属性并不会触发组件重新渲染，object.defineProperty不能拦截到这些操作

::: tip 
Object.defineProperty无法监控到数组下标的变化，导致直接通过数组的下标给数组设置值，不能实时响应。 为了解决这个问题，经过vue内部处理后可以使用以下几种方法来监听数组
:::

`push() pop() shift() unshift() splice() sort() reverse()`
由于只针对了以上八种方法进行了hack处理,所以其他数组的属性也是检测不到的，还是具有一定的局限性。

::: tip 
Object.defineProperty只能劫持对象的属性,因此我们需要对每个对象的每个属性进行遍历。Vue 2.x里，是通过 递归 + 遍历 data 对象来实现对数据的监控的，如果属性值也是对象那么需要深度遍历,显然如果能劫持一个完整的对象是才是更好的选择。
:::

`proxy`可以劫持整个对象，并返回一个新对象,有13种劫持操作

:point_right: [详情见](../javascript/Proxy与Reflect.md) :point_left: