---
title: 《你不知道的javascript(上)》对象
date: 2020-03-09
tags:
 - 你不知道的javascript
categories:
 -  JavaScript
sidebar: auto
---

![](https://resource.limeili.top/abstract/abstract%20(3).jpg)
<!-- more -->
## 对象
### 属性描述符
1. 默认值
* `通过非Object.defineProperty`的方式声明的属性默认值
```js
var obj = { a: 1 };
Object.getOwnPropertyDescriptor(obj, 'a');
/*{
    value: 1, 
    writable: true,
    enumerable: true, 
    configurable: true
}*/
```
* 通过`Object.defineProperty`的方式声明的属性默认值
```js
var obj = {};
Object.defineProperty(obj, 'a', {});
Object.getOwnpropertyDescriptor(obj, 'a');
/*{
    value: undefined,
    writable: false,
    enumerable: false,
    configurable: false
}*/
```
2. configurabele属性
* configurable属性设为false为不可逆过程
* configurable:false其他属性无法修改同时会禁止删除该属性
* `特例：`configurable: false时，writable的状态可由true改为false，但不能由false变为true

### 不变性
1. 对象常量
结合 `writable:false 和 configurable:false` 就可以创建一个真正的常量属性（不可修改、 重定义或者删除）
2. 禁止扩展
`Object.preventExtensions()`不可添加新属性（可删除可修改可重定义）  
`Object.isExtensible()`不可扩展返回false
3. 密封
`Object.seal()`这个方法实际上会在一个现有对象上调用 Object.preventExtensions(..) 并把所有现有属性标记为 configurable:false。     
所以，密封之后不仅`不能添加新属性`，`也不能重新配置或者删除任何现有属性`（虽然可以 修改writable为true的属性的值  
`Object.isSealed()`密封时返回true
```js
var obj = {a: 1, b: 2};
Object.seal(obj);

obj.c = 3; // {a: 1, b: 2} 不可添加
delete obj.a; // {a: 1, b: 2} 不可删除
// configurable:false 不可重定义

obj.a = 2; // {a: 2, b: 2} 可修改

Object.isSealed(obj); // true
```
4.冻结
`Object.freeze(..)` 会创建一个冻结对象，这个方法实际上会在一个现有对象上调用 Object.seal(..) 并把所有“数据访问”属性标记为 writable:false，这样就无法修改它们的值。

### [[Get]]和[[Put]]
1. [[Get]]
myObject.a 是一次属性访问，但是这条语句并不仅仅是在 myObjet 中查找名字为 a 的属性， 虽然看起来好像是这样

在语言规范中，myObject.a 在 myObject 上实际上是实现了 [[Get]] 操作（有点像函数调 用：[[Get]]()）。对象默认的内置 [[Get]] 操作首先在对象中查找是否有名称相同的属性， 如果找到就会返回这个属性的值。 然而，如果没有找到名称相同的属性，遍历可能存在的 [[Prototype]] 链， 也就是原型链。  
 如果无论如何都没有找到名称相同的属性，那 [[Get]] 操作会返回值 undefined  

 ```js
 var myObject = { a: undefined};
 myObject.a; // undefined 
 myObject.b; // undefined
 ```
 从返回值的角度来说，这两个引用没有区别——它们都返回了 undefined。然而，尽管乍 看之下没什么区别，实际上底层的 [[Get]] 操作对 myObject.b 进行了更复杂的处理。  

 和访问变量是不一样的，访问undeclared的变量会ReferenceError:b is not define 


2. [[Put]]
既然有可以获取属性值的 [[Get]] 操作，就一定有对应的 [[Put]] 操作。 你可能会认为给对象的属性赋值会触发 [[Put]] 来设置或者创建这个属性。但是实际情况并不完全是这样。 [[Put]] 被触发时，实际的行为取决于许多因素，包括对象中是否已经存在这个属性（这 是最重要的因素）。 如果已经存在这个属性，[[Put]] 算法大致会检查下面这些内容。  
1. 属性是否是访问描述符.如果是并且存在 setter 就调用 setter。 
2. 属性的数据描述符中 writable 是否是 false ？如果是，在非严格模式下静默失败，在 严格模式下抛出 TypeError 异常。 
3. 如果都不是，将该值设置为属性的值。
如果对象中不存在这个属性，[[Put]] 操作会更加复杂

### Getter和Setter
当你给一个属性定义 getter、setter 或者两者都有时，这个属性会被定义为“访问描述 符”（和“数据描述符”相对）。对于访问描述符来说，JavaScript 会忽略它们的 value 和 writable 特性，取而代之的是关心 set 和 get（还有 configurable 和 enumerable）特性。
### 存在性
`in`操作符：检查属性是否在对象及其原型链中  
`hasOwnProperty`：仅检查属性是否在该对象上  
因此，可结合二者来判断属性是否仅存在与原型链上  
```js
function hasPrototypeProperty(obj, property) {
    return (property in obj) && !(obj.hasOwnProperty(property));
}
```
所 有 的 普 通 对 象 都 可 以 通 过 对 于 Object.prototype 的 委 托来 访 问 hasOwnProperty(..)，但是有的对象可能没有连接到 Object.prototype（通过 Object. create(null) 来创建）。在这种情况下，形如 myObejct.hasOwnProperty(..) 就会失败。 这 时 可 以 使 用 一 种 更 加 强 硬 的 方 法 来 进 行 判 断：`Object.prototype.hasOwnProperty. call(myObject,"a")`，它借用基础的 hasOwnProperty(..) 方法并把它显式绑定到 myObject 上。  

:::tip
看起来 in 操作符可以检查容器内是否有某个值，但是它实际上检查的是某 个属性名是否存在。对于数组来说这个区别非常重要，4 in [2, 4, 6] 的结 果并不是你期待的 True，因为 [2, 4, 6] 这个数组中包含的属性名是 0、1、 2，没有 4。
:::


### 可枚举

```js
var myObject = { }; 
Object.defineProperty( myObject, "a", // 让 a 像普通属性一样可以枚举 
  { enumerable: true, value: 2 } );
Object.defineProperty(myObject, "b", // 让 b 不可枚举 
  { enumerable: false, value: 3 } );
myObject.propertyIsEnumerable( "a" ); // true 
myObject.propertyIsEnumerable( "b" ); // false 
Object.keys( myObject ); // ["a"] 
Object.getOwnPropertyNames( myObject ); // ["a", "b"]

```
* `propertyIsEnumerable`会检查给定的属性名是否直接存在于对象中（而不是在原型链 上）并且满足 enumerable:true
* `Object.keys(..)` 会返回一个数组，包含所有可枚举属性，
* `Object.getOwnPropertyNames(..)` 会返回一个数组，包含所有属性，无论它们是否可枚举

:::tip
in 和 hasOwnProperty(..) 的区别在于是否查找 [[Prototype]] 链，然而，Object.keys(..) 和 Object.getOwnPropertyNames(..) 都只会查找对象直接包含的属性
:::

### 遍历
for..in 循环可以用来遍历对象的可枚举属性列表(包括 [[Prototype]] 链)。  
对于数值索引的数组来说，可以使用标准的 for 循环来遍历值，或者使用for...of循环，for..of 循环首先会向被访问对象请求一个迭代器对象，然后通过调用迭代器对象的next() 方法来遍历所有返回值。
```js
var myArray = [1, 2, 3];
for (var i = 0; i < myArray.length; i++) { 
  console.log( myArray[i] ); 
}// 1 2 3

var myArray = [ 1, 2, 3 ];
for (var v of myArray) { 
  console.log( v ); 
}
//1
//2
//3

```
数组有内置的 @@iterator，因此 for..of 可以直接应用在数组上。我们使用内置的 @@ iterator 来手动遍历数组，看看它是怎么工作的：
```js
var myArray = [ 1, 2, 3 ];
var it = myArray[Symbol.iterator](); it.next(); // { value:1, done:false } 
it.next(); // { value:2, done:false } 
it.next(); // { value:3, done:false } 
it.next(); // { done:true }
//我们使用 ES6 中的符号 Symbol.iterator 来获取对象的 @@iterator 内部属 性。
```

和数组不同，普通的对象没有内置的 @@iterator，所以无法自动完成 for..of 遍历。之所 以要这样做，有许多非常复杂的原因，不过简单来说，这样做是为了避免影响未来的对象 类型。 当然，你可以给任何想遍历的对象定义 @@iterator，举例来说
```js
var myObject = {
  a: 2,
  b: 3
};
Object.defineProperty( myObject, Symbol.iterator, {
  enumerable: false,
  writable: false,
  configurable: true,
  value: function() {
    var o = this;
    var idx = 0;
    var ks = Object.keys( o );
    return {
      next: function() {
        return {
          value: o[ks[idx++]],
          done: (idx > ks.length)
        };
      }
    };
  }
} );
// 手动遍历 myObject
var it = myObject[Symbol.iterator]();
it.next(); // { value:2, done:false }
it.next(); // { value:3, done:false }
it.next(); // { value:undefined, done:true }
// 用 for..of 遍历 myObject
for (var v of myObject) {
  console.log( v );
}
// 2
// 3
```
我们使用 Object.defineProperty(..) 定义了我们自己的@@iterator（主要是为了让它不可枚举），不过注意，我们把符号当作可计算属性名。此外，也可以直接在定义对象时进行声明，比如 var myObject = { a:2, b:3, [Symbol.iterator]: function() { /* .. */ } }。
