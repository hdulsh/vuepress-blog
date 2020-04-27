---
title: Object.asign原理及其实现
date: 2020-03-15
tags:
categories:
 -  JavaScript
sidebar: auto
---

![](https://resource.limeili.top/abstract/abstract%20(12).jpg)
<!-- more -->
>[Object.asign原理及其实现](https://muyiy.cn/blog/4/4.2.html)

## 浅拷贝 Object.assign
将所有可枚举属性的值从一个或多个源对象复制到目标对象，同时返回目标对象  
`Object.assign(target, ...sources)`
如果目标对象中的属性具有相同的键，则属性将被源对象中的属性覆盖。后来的源对象的属性将类似地覆盖早先的属性  
我们知道浅拷贝就是拷贝第一层的基本类型值，以及第一层的引用类型地址  
String 类型和 Symbol 类型的属性都会被拷贝，而且不会跳过那些值为 null 或 undefined 的源对象
```js
let a = {
    name: "muyiy",
    age: 18
}
let b = {
    b1: Symbol("muyiy"),
    b2: null,
    b3: undefined
}
let c = Object.assign(a, b);
console.log(c);
// {
// 	name: "muyiy",
//  age: 18,
// 	b1: Symbol(muyiy),
// 	b2: null,
// 	b3: undefined
// } 
console.log(a === c);
// true
```
## 模拟实现
1. 判断原生 Object 是否支持该函数，如果不存在的话创建一个函数 assign，并使用 Object.defineProperty 将该函数绑定到 Object 上。

2. 判断参数是否正确（目标对象不能为空，我们可以直接设置{}传递进去,但必须设置值）。

3. 使用 Object() 转成对象，并保存为 to，最后返回这个对象 to。

4. 使用 for..in 循环遍历出所有可枚举的自有属性。并复制给新的目标对象（使用 hasOwnProperty 获取自有属性，即非原型链上的属性）

```js
if (typeof Object.assign2 != 'function') {
  // Attention 1
  Object.defineProperty(Object, "assign2", {
    value: function (target) {
      'use strict';
      if (target == null) { // Attention 2
        throw new TypeError('Cannot convert undefined or null to object');
      }

      // Attention 3
      var to = Object(target);
        
      for (var index = 1; index < arguments.length; index++) {
        var nextSource = arguments[index];

        if (nextSource != null) {  // Attention 2
          // Attention 4
          for (var nextKey in nextSource) {
            if (Object.prototype.hasOwnProperty.call(nextSource, nextKey)) {
              to[nextKey] = nextSource[nextKey];
            }
          }
        }
      }
      return to;
    },
    writable: true,
    configurable: true
  });
}
```
### 注意1：可枚举性
```js
for(var i in Object) {
    console.log(Object[i]);
}
// 无输出

Object.keys( Object );
// []
```
* 原生情况下挂载在 Object 上的属性是不可枚举的，但是直接在 Object 上挂载属性 a 之后是可枚举的，所以这里必须使用 Object.defineProperty，并设置 enumerable: false 以及 writable: true, configurable: true  
* 我们可以使用 2 种方法查看 Object.assign 是否可枚举
```js
// 方法1
Object.getOwnPropertyDescriptor(Object, "assign");
// {
// 	value: ƒ, 
//  writable: true, 	// 可写
//  enumerable: false,  // 不可枚举，注意这里是 false
//  configurable: true	// 可配置
// }

// 方法2
Object.propertyIsEnumerable("assign");
// false
```
**上面代码说明 Object.assign 是不可枚举的**  

介绍这么多是因为直接在 Object 上挂载属性 a 之后是可枚举的，
```js
Object.a = function () {
    console.log("log a");
}

Object.getOwnPropertyDescriptor(Object, "a");
// {
// 	value: ƒ, 
//  writable: true, 
//  enumerable: true,  // 注意这里是 true
//  configurable: true
// }

Object.propertyIsEnumerable("a");
// true
```
**所以要实现 Object.assign 必须使用 Object.defineProperty**  
**并设置 `writable: true, enumerable: false, configurable: true，`当然默认情况下不设置就是 false。**  
```js
Object.defineProperty(Object, "b", {
    value: function() {
        console.log("log b");
    }
});

Object.getOwnPropertyDescriptor(Object, "b");
// {
// 	value: ƒ, 
//  writable: false, 	// 注意这里是 false
//  enumerable: false,  // 注意这里是 false
//  configurable: false	// 注意这里是 false
// }
```

### 判断参数是否正确
```js
if (target == null) { // TypeError if undefined or null
	throw new TypeError('Cannot convert undefined or null to object');
}
```
没必要用`if (target === undefined || target === null) `因为 undefined 和 null 是相等的

### 原始类型被包装为对象
```js
var v1 = "abc";
var v2 = true;
var v3 = 10;
var v4 = Symbol("foo");

var obj = Object.assign({}, v1, null, v2, undefined, v3, v4); 
// 原始类型会被包装，null 和 undefined 会被忽略。
// 注意，只有字符串的包装对象才可能有自身可枚举属性。
console.log(obj); 
// { "0": "a", "1": "b", "2": "c" }
```
v2、v3、v4 实际上被忽略了，原因在于他们自身没有可枚举属性。 
```js
var v1 = "abc";
var v2 = true;
var v3 = 10;
var v4 = Symbol("foo");
var v5 = null;

// Object.keys(..) 返回一个数组，包含所有可枚举属性
// 只会查找对象直接包含的属性，不查找[[Prototype]]链
Object.keys( v1 ); // [ '0', '1', '2' ]
Object.keys( v2 ); // []
Object.keys( v3 ); // []
Object.keys( v4 ); // []
Object.keys( v5 ); 
// TypeError: Cannot convert undefined or null to object

// Object.getOwnPropertyNames(..) 返回一个数组，包含所有属性，无论它们是否可枚举
// 只会查找对象直接包含的属性，不查找[[Prototype]]链
Object.getOwnPropertyNames( v1 ); // [ '0', '1', '2', 'length' ]
Object.getOwnPropertyNames( v2 ); // []
Object.getOwnPropertyNames( v3 ); // []
Object.getOwnPropertyNames( v4 ); // []
Object.getOwnPropertyNames( v5 ); 
// TypeError: Cannot convert undefined or null to object
```
目标对象是原始类型，会包装成对象，对应上面的代码就是目标对象 a 会被包装成 [String: 'abc']，那模拟实现时应该如何处理呢？很简单，使用 Object(..) 就可以了。
```js
var a = "abc";
console.log( Object(a) );
// [String: 'abc']
```
```js
var a = "abc";
var b = "def";
Object.assign(a, b); 
```
会提示以下错误`TypeError: Cannot assign to read only property '0' of object '[object String]'`原因在于 Object("abc") 时，其属性描述符为不可写，即 writable: false。
```js
var myObject = Object( "abc" );

Object.getOwnPropertyNames( myObject );
// [ '0', '1', '2', 'length' ]

Object.getOwnPropertyDescriptor(myObject, "0");
// { 
//   value: 'a',
//   writable: false, // 注意这里
//   enumerable: true,
//   configurable: false 
// }
```
但是并不是说只要 writable: false 就会报错，看下面的代码。
```js
var myObject = Object('abc'); 

Object.getOwnPropertyDescriptor(myObject, '0');
// { 
//   value: 'a',
//   writable: false, // 注意这里
//   enumerable: true,
//   configurable: false 
// }

myObject[0] = 'd';
// 'd'

myObject[0];
// 'a'
```
这里并没有报错，原因在于 JS 对于不可写的属性值的修改静默失败（silently failed）,在严格模式下才会提示错误  
所以我们在模拟实现 Object.assign 时需要使用严格模式。

### 存在性
[详情见这里](./你不知道的javascript上对象.md#存在性)  

这边使用了 in 操作符和 hasOwnProperty 方法，区别如下（你不知道的JS上卷 P119）：

1. in 操作符会检查属性是否在对象及其 [[Prototype]] 原型链中。

2. hasOwnProperty(..) 只会检查属性是否在 myObject 对象中，不会检查 [[Prototype]] 原型链。
  

Object.assign 方法肯定不会拷贝原型链上的属性，所以模拟实现时需要用 hasOwnProperty(..) 判断处理下，但是直接使用 myObject.hasOwnProperty(..) 是有问题的，因为有的对象可能没有连接到 Object.prototype 上（比如通过 Object.create(null) 来创建），这种情况下，使用 myObject.hasOwnProperty(..) 就会失败。

```js
var myObject = Object.create( null );
myObject.b = 2;

("b" in myObject); 
// true

myObject.hasOwnProperty( "b" );
// TypeError: myObject.hasOwnProperty is not a function
```
`解决办法`使用call
```js
// 使用 for..in 遍历对象 nextSource 获取属性值
// 此处会同时检查其原型链上的属性
for (var nextKey in nextSource) {
    // 使用 hasOwnProperty 判断对象 nextSource 中是否存在属性 nextKey
    // 过滤其原型链上的属性
    if (Object.prototype.hasOwnProperty.call(nextSource, nextKey)) {
        // 赋值给对象 to,并在遍历结束后返回对象 to
        to[nextKey] = nextSource[nextKey];
    }
}
```