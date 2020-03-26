---
title: bind的模拟实现
date: 2020-03-15
tags:
 - call
 - apply 
 - bind
categories:
 -  JavaScript
sidebar: auto
---
>[深度解析bind原理、使用场景及模拟实现](https://muyiy.cn/blog/3/3.4.html#bind)


## bind()
bind() 方法会创建一个新函数。当这个新函数被调用时，bind() 的第一个参数将作为它运行时的 this，传入bind方法的第二个以及以后的参数加上绑定函数运行时本身的参数按照顺序作为原函数的参数来调用原函数  
`bind返回的绑定函数也能使用 new 操作符创建对象：这种行为就像把原函数当成构造器，提供的 this 值被忽略，同时调用时的参数被提供给模拟函数`

```js
var value = 2;

var foo = {
    value: 1
};

function bar(name, age) {
    return {
		value: this.value,
		name: name,
		age: age
    }
};

bar.call(foo, "Jack", 20); // 直接执行了函数
// {value: 1, name: "Jack", age: 20}

var bindFoo1 = bar.bind(foo, "Jack", 20); // 返回一个函数
bindFoo1();
// {value: 1, name: "Jack", age: 20}

var bindFoo2 = bar.bind(foo, "Jack"); // 返回一个函数
bindFoo2(20);
// {value: 1, name: "Jack", age: 20}
```
由此我们可以首先得出 bind 函数的两个特点：

1. 可以指定this
2. 返回一个函数
3. 可以传入参数
4. 柯里化

## 使用场景
1. 业务场景
```js
var nickname = "Kitty";
function Person(name){
    this.nickname = name;
    this.distractedGreeting = function() {

        setTimeout(function(){
            console.log("Hello, my name is " + this.nickname);
        }, 500);
    }
}
 
var person = new Person('jawil');
person.distractedGreeting();
//Hello, my name is Kitty
```
这里输出的nickname是全局的，并不是我们创建 person 时传入的参数，因为 setTimeout 在全局环境中执行
`解决方案一`缓存 this值
```js
var nickname = "Kitty";
function Person(name){
    this.nickname = name;
    this.distractedGreeting = function() {
        
		var self = this; // added
        setTimeout(function(){
            console.log("Hello, my name is " + self.nickname); // changed
        }, 500);
    }
}
 
var person = new Person('jawil');
person.distractedGreeting();
// Hello, my name is jawil
```
`解决方案二`使用 bind
```js
var nickname = "Kitty";
function Person(name){
    this.nickname = name;
    this.distractedGreeting = function() {

        setTimeout(function(){
            console.log("Hello, my name is " + this.nickname);
        }.bind(this), 500);
    }
}
 
var person = new Person('jawil');
person.distractedGreeting();
// Hello, my name is jawil

```
2. 验证是否是数组
```js
var toStr = Function.prototype.call.bind(Object.prototype.toString);
function isArray(obj){ 
    return toStr(obj) === '[object Array]';
}
isArray([1, 2, 3]);
// true

// 使用改造后的 toStr
toStr([1, 2, 3]); 	// "[object Array]"
toStr("123"); 		// "[object String]"
toStr(123); 		// "[object Number]"
toStr(Object(123)); // "[object Number]"
```
上面方法首先使用 Function.prototype.call函数指定一个 this 值，然后 .bind 返回一个新的函数，始终将 Object.prototype.toString 设置为传入参数。其实等价于 Object.prototype.toString.call() 。

这里有一个前提是toString()方法没有被覆盖

3. 柯里化
`只传递给函数一部分参数来调用它，让它返回一个函数去处理剩下的参数。 `

 可以一次性地调用柯里化函数，也可以每次只传一个参数分多次调用。

```js
var add = function(x) {
  return function(y) {
    return x + y;
  };
};

var increment = add(1);
var addTen = add(10);

increment(2);
// 3

addTen(2);
// 12

add(1)(2);
// 3
```
这里定义了一个 add 函数，它接受一个参数并返回一个新的函数。调用 add 之后，返回的函数就通过闭包的方式记住了 add 的第一个参数。所以说 bind 本身也是闭包的一种使用场景


## 模拟实现
### 第一步
对于第 1 点，使用 call / apply 指定 this   

对于第 2 点，使用 return 返回一个函数。  

结合前面 2 点，可以写出第一版，代码如下：
```js
// 第一版
Function.prototype.bind2 = function(context) {
    var self = this; // this 指向调用者
    return function () { // 实现第 2点
        return self.apply(context); // 实现第 1 点
    }
}
```
### 第二步
对于第 3 点，使用 arguments 获取参数数组并作为 self.apply() 的第二个参数。  

对于第 4 点，获取返回函数的参数，然后同第3点的参数合并成一个参数数组，并作为 self.apply() 的第二个参数。
```js
// 第二版
Function.prototype.bind2 = function (context) {

    var self = this;
    // 实现第3点，因为第1个参数是指定的this,所以只截取第1个之后的参数
	// arr.slice(begin); 即 [begin, end]
    var args = Array.prototype.slice.call(arguments, 1); 

    return function () {
        // 实现第4点，这时的arguments是指bind返回的函数传入的参数
        // 即 return function 的参数
        var bindArgs = Array.prototype.slice.call(arguments);
        return self.apply( context, args.concat(bindArgs) );
    }
```
### 第三步
到现在已经完成大部分了，但是还有一个难点，bind 有以下一个特性

`一个绑定函数也能使用new操作符创建对象：这种行为就像把原函数当成构造器，提供的 this 值被忽略，同时调用时的参数被提供给模拟函数。`
```js
var value = 2;
var foo = {
    value: 1
};
function bar(name, age) {
    this.habit = 'shopping';
    console.log(this.value);
    console.log(name);
    console.log(age);
}
bar.prototype.friend = 'kevin';

var bindFoo = bar.bind(foo, 'Jack');
var obj = new bindFoo(20);
// undefined
// Jack
// 20

obj.habit;
// shopping

obj.friend;
// kevin
```
上面例子中，运行结果this.value 输出为 undefined，这不是全局value 也不是foo对象中的value，这说明 bind 的 this 对象失效了，new 的实现中生成一个新的对象，这个时候的 this指向的是 obj  
这里可以通过修改返回函数的原型来实现，代码如下：
```js
// 第三版
Function.prototype.bind2 = function (context) {
    var self = this;
    var args = Array.prototype.slice.call(arguments, 1);

    var fBound = function () {
        var bindArgs = Array.prototype.slice.call(arguments);
        
        // 注释1
        return self.apply(
            this instanceof fBound ? this : context, 
            args.concat(bindArgs)
        );
    }
    // 注释2
    fBound.prototype = this.prototype;
    return fBound;
}
```
1. `注释1`  

当作为构造函数时，this 指向实例，此时 this instanceof fBound 结果为 true，可以让实例获得来自绑定函数的值，即上例中实例会具有 habit 属性。  
当作为普通函数时，this 指向 window，此时结果为 false，将绑定函数的 this 指向 context
2. `注释2`  

修改返回函数的 prototype 为绑定函数的 prototype，实例就可以继承绑定函数的原型中的值，即上例中 obj 可以获取到 bar 原型上的 friend。

### 第四步
上面实现中 fBound.prototype = this.prototype有一个缺点，直接修改 fBound.prototype 的时候，也会直接修改 this.prototype。
```js
// 测试用例
var value = 2;
var foo = {
    value: 1
};
function bar(name, age) {
    this.habit = 'shopping';
    console.log(this.value);
    console.log(name);
    console.log(age);
}
bar.prototype.friend = 'kevin';

var bindFoo = bar.bind2(foo, 'Jack'); // bind2
var obj = new bindFoo(20); // 返回正确
// undefined
// Jack
// 20

obj.habit; // 返回正确
// shopping

obj.friend; // 返回正确
// kevin

obj.__proto__.friend = "Kitty"; // 修改原型

bar.prototype.friend; // 返回错误，这里被修改了
// Kitty
```
解决方案是用一个空对象作为中介，把 fBound.prototype 赋值为空对象的实例（原型式继承）
```js
var fNOP = function () {};			// 创建一个空对象
fNOP.prototype = this.prototype; 	// 空对象的原型指向绑定函数的原型
fBound.prototype = new fNOP();		// 空对象的实例赋值给 fBound.prototype
```
这边可以直接使用ES5的 Object.create()方法生成一个新对象
```js
fBound.prototype = Object.create(this.prototype);
```
代码如下：
```js
// 第四版，已通过测试用例
Function.prototype.bind2 = function (context) {
    var self = this;
    var args = Array.prototype.slice.call(arguments, 1);

    var fNOP = function () {};

    var fBound = function () {
        var bindArgs = Array.prototype.slice.call(arguments);
        return self.apply(
            this instanceof fNOP ? this : context, 
            args.concat(bindArgs)
        );
    }

    fNOP.prototype = this.prototype;
    fBound.prototype = new fNOP();
    return fBound;
}
```

### 第五步
到这里其实已经差不多了，但有一个问题是调用 bind 的不是函数，这时候需要抛出异常。
```js
Function.prototype.bind2 = function (context) {

    if (typeof this !== "function") {
      throw new Error("Function.prototype.bind - what is trying to be bound is not callable");
    }

    var self = this;
    var args = Array.prototype.slice.call(arguments, 1);

    var fNOP = function () {};

    var fBound = function () {
        var bindArgs = Array.prototype.slice.call(arguments);
        return self.apply(this instanceof fNOP ? this : context, args.concat(bindArgs));
    }

    fNOP.prototype = this.prototype;
    fBound.prototype = new fNOP();
    return fBound;
}
```
