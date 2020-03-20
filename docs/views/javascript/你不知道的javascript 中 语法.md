---
title: 你不知道的javascript中语法
date: 2020-03-09
tags:
 - 你不知道的javascript
categories:
 -  JavaScript
sidebar: auto
---


## 语句和表达式
JavaScript 中表达式可以返回一个结果值,3 * 6 是一个表达式（结果为 18）。第二行的 a 也是一个表达式，第三行的 b 也是。
表达式 a 和 b 的结果值都是 18
```js
var a = 3 * 6;
var b = a;
b;
```
这三行代码都是包含表达式的语句
* var a = 3 * 6 和 var b = a 称为`“声明语句”`,因为它们声明了变量（还可以为其赋值）
* a = 3 * 6 和 b = a（不带var）叫作`“赋值表达式”`
* 第三行代码中只有一个表达式 b，同时它也是一个语句（虽然没有太大意义）。这样的情况通常叫作`“表达式语句”`

### 语句的结果值
获得结果值最直接的方法是在浏览器开发控制台中输入语句，默认情况下控制台会显示所
执行的最后一条语句的结果值  
* 以赋值表达式 b = a 为例，其结果值是赋给 b 的值（18），但规范定义 var 的结果值是
undefined。如果在控制台中输入 var a = 42 会得到结果值 undefined，而非 42。
* 代码块 { .. } 的结果值就如同一个隐式的返回，即返回最后一个语句的结果值
```js
var b;
if (true) {
 b = 4 + 38;
}   // 42
```
* 语法不允许我们获得语句的结果值并将其赋值给另一个变量（至少目前不行）
```js
//这样的代码无法运行
var a, b;
a = if (true) {
 b = 4 + 38;
};
```
### 表达式的副作用
### 上下文规则

## 运算符优先级
```js
var a = 42;
var b = "foo";
var c = false;
var d = a && b || c ? c || b ? a : c && b : a;
d; // ??
```
### 短路
&& 和 || 来说，如果从左边的操作数能够得出结果，就可以忽略右边的操作数。我们将
这种现象称为“短路”（即执行最短路径）
以 a && b 为例，如果 a 是一个假值，足以决定 && 的结果，就没有必要再判断 b 的值。同
样对于 a || b，如果 a 是一个真值，也足以决定 || 的结果，也就没有必要再判断 b 的值  
```js
function doSomething(opts) {
 if (opts && opts.cool) {
 // .. 
 }
}

function doSomething(opts) {
 if (opts.cache || primeCache()) {
 // .. 
 }
}
```
### 更强的绑定
`a && b || c ? c || b ? a : c && b : a`
优先级`&& > || > ? :`
因此表达式 (a && b || c) 先于包含它的 ? : 运算符执行。另一种说法是 && 和 || 比 ? : 的
绑定更强


### 关联
一般说来，运算符的关联（associativity）不是从左到右就是从右到左，这取决于组合
（grouping）是从左开始还是从右开始
**关联和执行顺序不是一回事**
但它为什么又和执行顺序相关呢？原因是表达式可能会产生副作用，比如函数调用：
`var a = foo() && bar();`
这里 foo() 首先执行，它的返回结果决定了 bar() 是否执行。所以如果 bar() 在 foo() 之
前执行，整个结果会完全不同。  
这里遵循从左到右的顺序（JavaScript 的默认执行顺序），与 && 的关联无关。因为上例中只
有一个 && 运算符，所以不涉及组合和关联。  
1. 而 a && b && c 这样的表达式就涉及组合（隐式），这意味着 a && b 或 b && c 会先执行。  
从技术角度来说，因为 && 运算符是左关联（|| 也是），所以 a && b && c 会被处理为 (a 
&& b) && c。不过右关联 a && (b && c) 的结果也一样。

2. 如 ? :（即三元运算符或者条件运算符）是`右关联`
`a ? b : c ? d : e;` --->   `a ? b : (c ? d : e)`

3. 另一个右关联（组合）的例子是 = 运算符

`var a, b, c; a = b = c = 42;`
它首先执行 c = 42，然后是 b = ..，最后是 a = ..。因为是右关联，所以它实际上是这样
来处理的：`a = (b = (c = 42))`。

开始的例子可以转换成 `((a && b) || c) ? ((c || b) ? a : (c && b)) : a`

### 释疑
那么是否应该经常使用 ( ) 来自行控制运算符的执行而
不再依赖系统的自动操作呢
* 在编写程序时要将两者结合起来，既要依赖运算符优先级 / 关联规则，也要适当使用 ( ) 自行控制方式

## 自动分号

* 有时 JavaScript 会自动为代码行补上缺失的分号，即自动分号插入（Automatic Semicolon 
Insertion，ASI）
* ASI 只在换行符处起作用，而不会在代码行的中间插入分号
* ASI 实际上是一个“纠错”（error correction）机制。这里的错误
是指解析器错误。换句话说，ASI 的目的在于提高解析器的容错性
* 建议在所有需要的地方加上分号，将对 ASI 的依赖降到最低

## 错误
* JavaS
cript 不仅有各种类型的运行时错误（TypeError、ReferenceError、SyntaxError 等 ）  
* 在编译阶段发现的代码错误叫作“早期错误”（early error）。语法错误是早期错误的一种
（如 a = ,）。另外，语法正确但不符合语法规则的情况也存在  
* 这些错误在代码执行之前是无法用 try..catch 来捕获的，相反，它们还会导致解析 / 编译
失败。
`var a = /+foo/; // 错误！`语法没有问题，但非法的正
则表达式也会产生早期错误
`var a;42 = a; // 错误！`语法规定赋值对象必须是一个标识符（identifier，或者 ES6 中的解构表达式）

`在严格模式中，函数的参数不能重名,对象常量不能包含多个同名属性`

从语义角度来说，这些错误并非词法错误，而是语法错误，因为它们在词
法上是正确的。只不过由于没有 GrammarError 类型，一些浏览器选择用
SyntaxError 来代替

### 提前使用变量
TMD暂时性死区
```js
{
 a = 2; // ReferenceError!
 let a; 
}
```
a = 2 试图在 let a 初始化 a 之前使用该变量（其作用域在 { .. } 内），这里就是 a 的
TDZ，会产生错误  
有意思的是，对未声明变量使用 typeof 不会产生错误（参见第 1 章），但在 TDZ 中却会报错

```js
{
 typeof a; // undefined
 typeof b; // ReferenceError! (TDZ)
 let b;
}
```

## 函数参数
另一个 TDZ 违规的例子是 ES6 中的参数默认值
```js
var b = 3;
function foo( a = 42, b = a + b + 5 ) {
 // ..
}
```
b = a + b + 5 在参数 b（= 右边的 b，而不是函数外的那个）的 TDZ 中访问 b，所以会出
错。而访问 a 却没有问题，因为此时刚好跨出了参数 a 的 TDZ。

对 ES6 中的参数默认值而言，参数被省略或被赋值为 undefined 效果都一样，都是取该参
数的默认值。然而某些情况下，它们之间还是有区别的
```js
function foo( a = 42, b = a + 1 ) {
 console.log(
 arguments.length, a, b,
 arguments[0], arguments[1]
 );
}
foo(); // 0 42 43 undefined undefined
foo( 10 ); // 1 10 11 10 undefined
foo( 10, undefined ); // 2 10 11 10 undefined
foo( 10, null ); // 2 10 null 10 null
```
虽然参数 a 和 b 都有默认值，但是函数不带参数时，arguments 数组为空。
相反，如果向函数传递 undefined 值，则 arguments 数组中会出现一个值为 undefined 的单
元，而不是默认值。

ES6 参数默认值会导致 arguments 数组和相对应的命名参数之间出现偏差，ES5 也会出现
这种情况：
```js
function foo(a) {
 a = 42;
 console.log( arguments[0] );
}
foo( 2 ); // 42 (linked)
foo(); // undefined (not linked)
```
向函数传递参数时，arguments 数组中的对应单元会和命名参数建立关联（linkage）以得
到相同的值。相反，不传递参数就不会建立关联。
但是，在严格模式中并没有建立关联这一说
`foo( 2 ); // 2 (not linked)`

## try..finally
* finally 中的代码总是会在 try 之后执行，如果有 catch 的话则在 catch 之后执行。也可以
将 finally 中的代码看作一个回调函数，即无论出现什么情况最后一定会被调用。
1. 
```js
function foo() {
 try {
 return 42;
 } 
 finally {
 console.log( "Hello" );
 }
 console.log( "never runs" );
}
console.log( foo() );
// Hello
// 42
```
这里 return 42 先执行，并将 foo() 函数的返回值设置为 42。然后 try 执行完毕，接着执
行 finally。最后 foo() 函数执行完毕，console.log(..) 显示返回值  

2. 如果 finally 中抛出异常（无论是有意还是无意），函数就会在此处终止。如果此前 try 中
已经有 return 设置了返回值，则该值会被丢弃：
```js
function foo() {
 try {
 return 42;
 } 
 finally {
 throw "Oops!";
 }
 console.log( "never runs" );
}
console.log( foo() );
// Uncaught Exception: Oops!
```

```js
function foo() {
 try {
 return 42;
 } 
 finally {
 // 没有返回语句，所以没有覆盖
 } 
}
function bar() {
 try {
 return 42;
 }
 finally {
 // 覆盖前面的 return 42
 return; 
 }
}
function baz() {
 try {
 return 42;
 } 
 finally {
 // 覆盖前面的 return 42
 return "Hello";
 }
}
foo(); // 42
bar(); // undefined
baz(); // Hello
```
finally 中的 return 会覆盖 try 和 catch 中 return 的返回值  
但是
在 finally 中省略 return 则会返回前面的 return 设定的返回值

## switch
```js
switch (a) {
 case 2:
 // 执行一些代码
 break;
 case 42:
 // 执行另外一些代码
 break;
 default:
 // 执行缺省代码
}
```
* a 和 case 表达式的匹配算法与 ===相同 
* 有时可能会需要通过强制类型转换来进行相等比较

```js
var a = "42";
switch (true) {
 case a == 10:
 console.log( "10 or '10'" );
 break;
 case a == 42;
 console.log( "42 or '42'" );
 break;
 default:
 // 永远执行不到这里
}
// 42 or '42'
```
除简单值以外，case 中还可以出现各种表达式，它会将表达式的结果值和 true 进行比较。
因为 a == 42 的结果为 true，所以条件成立。

尽管可以使用 ==，但 switch 中 true 和 true 之间仍然是严格相等比较。即如果 case 表达
式的结果为真值，但不是严格意义上的 true（参见第 4 章），则条件不成立。所以，在这
里使用 || 和 && 等逻辑运算符就很容易掉进坑里
```js
var a = "hello world";
var b = 10;
switch (true) {
 case (a || b == 10):
 // 永远执行不到这里
 break;
 default:
 console.log( "Oops" );
}
// Oops
```
因为 (a || b == 10) 的结果是 "hello world" 而非 true，所以严格相等比较不成立。此时
可以通过强制表达式返回 true 或 false，如 case !!(a || b == 10)

```js
var a = 10;
switch (a) {
 case 1:
 case 2:
 // 永远执行不到这里
 default:
 console.log( "default" );
 case 3:
 console.log( "3" );
 break;
 case 4:
 console.log( "4" );
}
// default
// 3
```
上例中的代码是这样执行的，首先遍历并找到所有匹配的 case，如果没有匹配则执行
default 中的代码。因为其中没有 break，所以继续执行已经遍历过的 case 3 代码块，直
到 break 为止。