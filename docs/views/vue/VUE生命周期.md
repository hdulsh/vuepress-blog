---
title: VUE生命周期
date: 2019-09-18
tags:
 - VUE
 - 生命周期
categories:
 - VUE
sidebar: auto
---

![](https://resource.limeili.co/image/201910041807.png!imgabstract)
<!-- more -->

## 生命周期
对于Vue来说它的生命周期就是Vue实例从创建到销毁的过程
创建->挂载->更新->销毁

![](https://resource.limeili.co/image/201910041820.png)

`new Vue()`实例化Vue对象然后进行一些初始化
### 合并配置项
### 代理开发环境的错误
### 初始化自定义事件
随后进入`initLifecycle`，这部分没什么好讲的，初始化实例的一些生命周期的状态和一些额外属性，接着会进入初始化组件的自定义事件
`initEvents`只会挂载自定义事件，即组件中使用v-on监听的非native的事件（原生的DOM事件并非在initEvents中挂载）
### beforeCreate
添加完自定义事件后，进入`initRender`，定义插槽和给render函数的参数createElement，另外会将Vue的$attrs,$listeners变成响应式的属性

接着会执行callHook(vm, 'beforeCreate')，从字面上来看就能猜出Vue在这个时候会调用beforeCreate这个生命周期函数，在之前合并配置项的时候就提到，生命周期函数最终会被包裹成一个数组，所以事实上Vue也支持这么写

**callHook函数会根据传入的参数拿到$options属性中对应的生命周期函数组成的数组，这里传入了beforeCreate，所以会获得beforeCreate中定义的所有生命周期函数，之后顺序遍历并且用call方法给每个生命周期函数绑定了this上下文，这就是为什么生命周期函数不能使用剪头函数书写的原因**


![](https://resource.limeili.co/image/201910041927.png)


::: tip 
beforeCreate获取不到props data中的数据，访问不到computed watch methods
常用于初始化非响应变量，loading事件
:::

### 初始化数据
接着执行`initInjections`，这部分是用来初始化inject这个api
随后会进入另外一个关键的函数`initState`，它会依次初始化`props,methods,data,computed,watch`

**props**
组件之间通信的时候，父组件给子组件传参，子组件需要定义props来接受父组件传过来的属性，而Vue规定，子组件是不能修改父组件传来的props，因为这违背了单项数据流，会导致组件之间非常难以管理，如果在子组件修改了props，Vue会发出一个警告
而Vue又是怎么知道开发者修改了props的属性呢？原因还是利用了访问器描述符setter

![](https://resource.limeili.co/image/201910042003.png)
Vue会将props对象变成一个响应式对象，并且第四个参数是一个自定义的setter，当props被修改了会触发这个setter，一单违背了单项数据流时就会报出这个警告

**methods**
对于methods，Vue会定义一些开发过程中的不规范的警告，随后会将所有的method绑定vm实例，这样我们就可以直接通过this获取当前的vm实例

**data**
到了最关键的data，data中一般保存的是当前组件需要使用的数据，除了根实例之外，组件实例的data一般都是一个函数，因为JS引用类型的特点，如果使用对象，当存在多个相同的组件，其中一个组件修改了data数据，会反映到所有的组件。当data作为一个函数返回一个对象时，每次执行都会生成一个新的对象，可以有效的解决这个问题

![](https://resource.limeili.co/image/201910042008.png)
初始化data会执行initData这个函数，内部会执行定义的data函数并且把当前实例作为this值，并且赋值给_data这个内部属性,值得注意的是，在执行data函数的过程中是获取不到computed中的数据，因为computed中的数据此时还没初始化

随后执行proxy函数，它的作用是将`vm._data`的属性映射到vm属性上，起到了"代理"的作用，这样做是为了在开发过程中直接书写this[key]的形式，其原理依旧是利用了getter/setter，当我们访问this[key]的时候会触发getter，直接指向`this._data[key]`，setter同理
有人会问，那为啥不直接写在vm实例上呢？因为我们需要将数据放在一个统一的对象上进行管理，为的是下一步把_data通过observe变成一个响应式对象。而为了在开发的时候书写更加简洁，Vue采取了这种方法，非常的讨巧

**computed**
到了初始化computed，Vue会给每个计算属性生成一个computed watcher，只有当这个计算属性的依赖项改变了才会去通知computed watcher更新这个计算属性，从而既能达到实时更新数据，又不会浪费性能，也是Vue非常棒的功能

![](https://resource.limeili.co/image/201910042011.png)

**watch**
初始化watch的时候最终会调用$watch方法，生成一个user watcher，当监听的属性发生改变就会立即通知user watcher执行回调

### created
再调用initProvide初始化provide后就会执行callHook(vm, 'beforeCreate'),和beforeCreate一样，依次遍历定义在$options上的created数组，执行生命周期函数
至此整个组件创建完毕，其实这个时候就可以和后端进行交互获取数据了，但是对于真正的DOM节点还没有被渲染出来，一些需要和DOM的交互操作还无法在created钩子中执行，即无法在created钩子中有操作生成视图的DOM


::: tip 
created可以访问之前不能访问的数据但是组件还没有挂载是看不到的不能访问到$el属性 $ref是空数组
常用于简单的ajax请求，页面的初始化，与mounted区别是created页面视图未出现，如果请求信息过多会长时间白屏，如果父组件异步获取数据prop给子组件，需要在created时发给子组件
:::

### 挂载过程
回到_init函数，已经到了最后一行，会判断$options是否有el属性，在Vue-cli2的时候，cli会自动在new Vue的时候传入el参数，而对于Vue-cli3并没有这么做，而是生成根实例后主动调用$mount并传入了挂载的节点，其实两者都是一样的，也可以使用$mount来实现组件的手动挂载

Vue-cli2：

![](https://resource.limeili.co/image/201910042131.png)

Vue-cli3:

![](https://resource.limeili.co/image/201910042132.png)

$mount最终会执行mountComponent这个函数
![](https://resource.limeili.co/image/201910042142.png)

![](https://resource.limeili.co/image/201909052051.webp!png)

#### beforeMount
当组件执行$mount并且拥有挂载点和渲染函数的时候，就会触发beforeMount的钩子，准备组件的挂载


#### 渲染视图的函数updateComponent
之后Vue会定义一个updateComponent函数，这个函数是整个挂载的核心，它由2部分组成，`_render`函数和`_update`函数

* render函数最终会执行之前在`initRender`定义的createElement函数，作用是创建vnode
* update函数会将上面的render函数生成的vnode渲染成一个真实的DOM树，并挂载到挂载点上

第一次执行updateComponent会渲染出整个DOM树，这个时候页面就完整的被展现了

#### 渲染watcher
然后会实例化一个"渲染watcher"，将updateComponent作为回调函数传入，内部会立即执行一次updateComponet函数
watcher顾名思义是用来观察的，渲染watcher简而言之，就是会观察模版中依赖变量的是否变化来决定是否需要刷新页面，而updateComponet就是一个用来更新页面的函数，所以将这个函数作为回调传入。对于模版中的响应式变量内部都会保存这个渲染watcher（因为这些变量都有可能修改视图），一旦变量被修改了就会触发setter，最后都会再次执行updateComponent函数来刷新视图

#### mounted
watcher顾名思义是用来观察的，渲染watcher简而言之，就是会观察模版中依赖变量的是否变化来决定是否需要刷新页面，而updateComponet就是一个用来更新页面的函数，所以将这个函数作为回调传入。对于模版中的响应式变量(下图中的变量a)内部都会保存这个渲染watcher（因为这些变量都有可能修改视图），一旦变量被修改了就会触发setter，最后都会再次执行updateComponent函数来刷新视图

，在src/core/vdom/create-component.js的insert钩子（组件专属的vnode钩子）,同时Vue会声明一个insertedVnodeQueue数组，保存所有的组件vnode，每当一个组件vnode被渲染成DOM节点就会往这个数组里添加一个vnode元素，当组件全部渲染完毕后，会以子=>父的顺序依次触发mounted钩子（最先触发最里层组件的mounted钩子）。随后再回到_init方法，最后触发根实例的mounted钩子

![](https://resource.limeili.co/image/201910042200.png)

### 组件更新

回到mountComponent那张图，在实例化渲染watcher的时候，Vue会给渲染watcher传入一个对象，对象包含了一个before方法，执行before方法就会执行beforeUpdate钩子，那什么时候执行这个方法呢？
一旦模版的依赖的变量发生了变化，说明即将改变视图，会触发setter然后执行渲染watcher的回调，即updateComponent刷新视图，在执行这个回调前，Vue会查看是否有before这个方法，如果有则会优先执行before，然后再执行updateCompont刷新视图
Vue会将所有的watcher放入一个队列，`flushSchedulerQueue`会依次遍历这些watcer，而渲染watcher会有一个before方法，从而触发beforeUpdate钩子

![](https://resource.limeili.co/image/201910042212.png)
然后当所有的watcher都遍历过之后，代表数据已经更新完毕，并且视图也刷新了，此时会调用callUpdatedHooks，执行updated钩子

### 组件销毁
组件销毁的前提是发生了视图更新，Vue会判断生成新视图的vnode和旧视图对应的vnode的区别，然后删除那些视图中不需要渲染的节点，这个过程最终会调用实例的$destroy方法，对应源代码的src/core/instance/lifecycle.js
![](https://resource.limeili.co/image/201910042215.png)
1. 首先会直接执行beforeDestory的钩子，表示准备开始销毁节点，此时是可以和当前组件实例交互的最后时机
2. 随后会找到当前组件的父节点，从父节点的children属性中删除当前的节点
3. 对渲染watcher进行注销（`vm._watcher`存放的是每个组件唯一的渲染watcher）
4. 对其他的watcher进行注销（user watcher,computed watcher）
5. 清除这个实例渲染出的DOM节点
6. 执行destroyed钩子

至此整个Vue的生命周期结束了，最后再总结一下每个生命周期主要都做了什么事情，严格按照Vue内部的执行顺序罗列

* `beforeCreate`:将开发者定义的配置项和Vue内部的配置项进行合并，初始化组件的自定义事件，定义createElement函数/初始化插槽
* `created`:初始化inject，初始化所有数据（props -> methods -> data -> computed -> watch），初始化provide
* `beforeMount`:寻找是否有挂载的节点，根据render函数准备开始渲染页面/实例化渲染watcher
* mounted`:页面渲染完成
* `beforeUpdate`:渲染watcher依赖的变量发生变化，准备更新视图
* `updated`:视图和数据全部更新完毕
* `beforeDestroy`:注销watcher，删除DOM节点
* `destroyed`:注销所有监听事件


## 父子组件生命周期

### 初始化时
F-beforeCreate
F-created
F-beforeMount
		child-beforeCreate
		child-created
		child-beforeMount
		child-mounted
F-mounted
F-beforeUpdata
F-updated

### 子组件data中的值变化时
child-beforeUpdate
child-updated

### 父组件data中的值变化时
F-beforUpdate
F-updated

### props改变时
F-beforeUpdate
		child-beforeUpdate
		child-updated
F-updated

### 子组件销毁时
child-beforeDestory
child-destory

### 父组件销毁时
F-beforeDestory
		child-beforeDestory
		child-destory
F-destory

1. 仅当子组件完成挂载后，父组件才会挂载
2. 当子组件完成挂载后，父组件会主动执行一次beforeUpdate/updated钩子函数（仅首次）
3. 父子组件在data变化中是分别监控的，但是在更新props中的数据是关联的
4. 销毁父组件时，先将子组件销毁后才会销毁父组件

## 兄弟组件生命周期

### 初始化时
F-beforeCreate
F-created
F-beforeMount
		child1-beforeCreate
		child1-created
		child1-beforeMount
		child2-beforeCrated
		child2-created
		child2-beforMount
		child1-mounted
		child2-mounted
F-mounted
F-beforeUpdate
F-updated

### 父组件销毁时
F-beforDestory
		child1-beforDestory
		child1-destory
		child2-beforDestory
		child2-destory
F-destory

1. 组件的初始化（mounted之前）分开进行，挂载是从上到下依次进行
2. 当没有数据关联时，兄弟组件之间的更新和销毁是互不关联的

## activated和deactivated
keep-alive缓存组件内部状态，避免重复渲染 
`activated`组件第一次渲染时调用，之后每次缓存组件被激活时调用
mounted->activated
因为keep-alive会将组件保存在内存中，并不会销毁以及重新创建，所以不会重新调用组件的created等方法，需要activated和deactivated得知当前组件是否处于活动状态
`deactivated`页面被隐藏或即将被替换成新页面时执行