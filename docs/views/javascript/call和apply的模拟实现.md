---
title: call和apply的模拟实现
date: 2020-03-15
tags:
 - call
 - apply 
categories:
 -  JavaScript
sidebar: auto
---

![](https://resource.limeili.top/abstract/abstract%20(10).jpg)
<!-- more -->
>[深度解析 call 和 apply 原理、使用场景及实现](https://muyiy.cn/blog/3/3.3.html#call-%E5%92%8C-apply)

```js
var func = function(arg1, arg2) {
     ...
};

func.call(this, arg1, arg2); // 使用 call，参数列表
func.apply(this, [arg1, arg2]) // 使用 apply，参数数组
```
## 使用场景
1. 合并两个数组
`Array.prototype.push.apply(arr1, arr2)`或`[].push.apply(arr1, arr2)`
2. 获取数组中的最大值和最小值
```js
var numbers = [5, 458 , 120 , -215 ]; 
Math.max.apply(Math, numbers);   //458    
Math.max.call(Math, 5, 458 , 120 , -215); //458

// ES6
Math.max.call(Math, ...numbers); // 458
```
3. 判断变量类型
`Object.prototype.toString.call(obj) === '[object Array]'`

4. 类数组-->数组
` Array.prototype.slice.call(arguments)`
```js
//上面代码等同于
var arr = [].slice.call(arguments)

ES6:
let arr = Array.from(arguments);
let arr = [...arguments];
```
5. 继承
```js
function  SuperType(){
    this.color=["red", "green", "blue"];
}
function  SubType(){
    // 核心代码，继承自SuperType
    SuperType.call(this);
}

var instance1 = new SubType();
instance1.color.push("black");
console.log(instance1.color);
// ["red", "green", "blue", "black"]

var instance2 = new SubType();
console.log(instance2.color);
// ["red", "green", "blue"]
```
## call
```js
var value = 1;
var foo = {
    value: 1
};

function bar() {
    console.log(this.value);
}

bar.call(foo); // 1
```
注意两点：  
1. call 改变了 this 的指向，指向到 foo
2. bar 函数执行了
### 第一步
试想当调用 call 的时候，把 foo 对象改造成如下：  
```js
var foo = {
    value: 1,
    bar: function() {
        console.log(this.value)
    }
};

foo.bar(); // 1
```
这个改动就可以实现：改变了this的指向并且执行了函数bar。
但是这样写是有副作用的，即给foo额外添加了一个属性，怎么解决呢？
解决方法很简单，用 delete 删掉就好了。  
所以只要实现下面3步就可以模拟实现了。
1. 将函数设置为对象的属性：foo.fn = bar
2. 执行函数：foo.fn()
3. 删除函数：delete foo.fn
```js
// 第一版
Function.prototype.call2 = function(context) {
    // 首先要获取调用call的函数，用this可以获取
    context.fn = this; 		// foo.fn = bar
    context.fn();			// foo.fn()
    delete context.fn;		// delete foo.fn
}

// 测试一下
var foo = {
    value: 1
};

function bar() {
    console.log(this.value);
}

bar.call2(foo); // 1
```
### 第二步
第一版有一个问题，那就是函数 bar 不能接收参数，所以我们可以从 arguments中获取参数，取出第二个到最后一个参数放到数组中，为什么要抛弃第一个参数呢，因为第一个参数是 this  

类数组对象转成数组的方法上面已经介绍过了，但是这边使用ES3的方案来做。
```js
var args = [];
for(var i = 1, len = arguments.length; i < len; i++) {
    args.push('arguments[' + i + ']');
}
```
参数数组搞定了，接下来要做的就是执行函数 context.fn()。  
```js
context.fn( args.join(',') ); // 这样不行
```
上面直接调用肯定不行，args.join(',')会返回一个字符串，并不会执行。
这边采用 eval方法来实现，拼成一个函数。
```js
eval('context.fn(' + args +')')
```
上面代码中args 会自动调用 args.toString() 方法，因为'context.fn(' + args +')'本质上是字符串拼接，会自动调用toString()方法，如下代码
```js
var args = ["a1", "b2", "c3"];
console.log(args);
// ["a1", "b2", "c3"]

console.log(args.toString());
// a1,b2,c3

console.log("" + args);
// a1,b2,c3
```
所以说第二个版本就实现了，代码如下
```js
Function.prototype.call2 = function(context) {
    context.fn = this;
    var args = [];
    for(var i = 1, len = arguments.length; i < len; i++) {
        args.push('arguments[' + i + ']');
    }
    eval('context.fn(' + args +')');
    delete context.fn;
}

// 测试一下
var foo = {
    value: 1
};

function bar(name, age) {
    console.log(name)
    console.log(age)
    console.log(this.value);
}

bar.call2(foo, 'kevin', 18); 
// kevin
// 18
// 1
```
### 第三步
模拟代码已经完成 80%，还有两个小点要注意：
1. this 参数可以传 null，当为 null 的时候，视为指向 window
```js
var value = 1;

function bar() {
    console.log(this.value);
}

bar.call(null); // 1  虽然这个例子本身不使用 call，结果依然一样。
```
2. 函数是可以有返回值的！
```js
var obj = {
    value: 1
}

function bar(name, age) {
    return {
        value: this.value,
        name: name,
        age: age
    }
}

console.log(bar.call(obj, 'kevin', 18));
// Object {
//    value: 1,
//    name: 'kevin',
//    age: 18
// }
```
`最终`
```js
Function.prototype.call2 = function (context) {
    var context = context || window;
    context.fn = this;

    var args = [];
    for(var i = 1, len = arguments.length; i < len; i++) {
        args.push('arguments[' + i + ']');
    }

    var result = eval('context.fn(' + args +')');

    delete context.fn
    return result;
}
```
**ES6**
```js
Function.prototype.call = function (context) {
  context = context ? Object(context) : window; 
  context.fn = this;

  let args = [...arguments].slice(1);
  let result = context.fn(...args);

  delete context.fn
  return result;
}
```

## apply
```js
Function.prototype.apply = function (context, arr) {
    context = context ? Object(context) : window; 
    context.fn = this;

    var result;
    // 判断是否存在第二个参数
    if (!arr) {
        result = context.fn();
    } else {
        var args = [];
        for (var i = 0, len = arr.length; i < len; i++) {
            args.push('arr[' + i + ']');
        }
        result = eval('context.fn(' + args + ')');
    }

    delete context.fn
    return result;
}
```
**ES6**
```js
Function.prototype.apply = function (context, arr) {
    context = context ? Object(context) : window; 
    context.fn = this;
  
    let result;
    if (!arr) {
        result = context.fn();
    } else {
        result = context.fn(...arr);
    }
      
    delete context.fn
    return result;
}
```

