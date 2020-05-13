---
title: 《你不知道的javascript(中)》类型
date: 2020-03-09
tags:
 - 类型 
 - 值
 - 强制类型转换
 - 你不知道的javascript
categories:
 - JavaScript
sidebar: auto
---
![](https://resource.limeili.top/abstract/abstract%20(6).jpg)
<!-- more -->
## 类型

七种内置类型:
* number
* string
* boolean
* null
* undefined
* object
* symbol
***
***
***
***
2020-05-12增  
  
**7+2**  
基本类型：number string boolean null undefined symbol bigint  

引用类型：  
* object(细分为普通对象、数组对象、正则对象、日期对象、Math....)
* function (为什么单独分出来因为_proto_ 是Function.prototype)  

**对象的属性名一定不能是引用类型值，默认会把引用类型值转换为字符串进行处理**
```js
let a = {
  x: 100
}
let b = function fn() {
  let a = 100
}
let obj = {
  0: 100,
  true: '小可爱'
}
obj[a] = 1000
obj[b] = 2000
//输出obj
//{0: 100, true: "小可爱", [object Object]: 1000, "function fn() {↵  let a = 100↵}": 2000}
//0: 100
//true: "小可爱"
//[object Object]: 1000
//"function fn() {↵ let a = 100↵}": 2000
```
```js
let a = {
  x: 100
}
let b = {
  y: 200
}
let obj = {}
obj[a] = '可可' //=>obj["[object Object]"] = '可可'
obj[b] = '爱爱' //=>obj["[object Object]"] = '爱爱'
console.log(obj[a]=== obj[b]) // true
//输出obj
//{[object Object]: "爱爱"}
//[object Object]: "爱爱"

```
***
***
***
***
1. 除对象外其他的称为 **基本类型** ，可以使用 typeof 运算符来查看 typeof null === "object"

::: tip
不同的对象在底层原理的存储是用二进制表示的，在 javaScript中，如果二进制的前三位都为 0 的话，系统会判定为是 Object类型。null的存储二进制是 000，也是前三位，所以系统判定 null为 Object类型。

000：对象类型
1：整型
100：字符串
110：布尔类型
:::

2. array 和 function 属于object的子类型，具体来说，函数是“可调用对象”，它有一个内部属
性 [[Call]]，该属性使其可以被调用。

3. js中变量是没有类型的，执行typeof操作得到的结果并不是改变量的类型，而是变量持有的值的类型

`undefined 和 undeclared`
已在作用域中声明但还没有赋值的变量，是 undefined 的。
相反，还没有在作用域中声明过的变量，是 undeclared 的。
```js
var a;
a; // undefined
b; // ReferenceError: b is not defined
typeof(a);//undefined
typeof(b); //undefined
```
* undefined和is not defined是两码事。此时如果浏览器报错成“b is not found”或者“b is not declared”会更准确
* 虽然 b 是
一个 undeclared 变量，但 typeof b 并没有报错。这是因为 typeof 有一个特殊的`安全防范机制`
```js
// 这样会抛出错误
if (DEBUG) {
 console.log( "Debugging is starting" );
}
// 这样是安全的
if (typeof DEBUG !== "undefined") {
 console.log( "Debugging is starting" );
}
```
经常会判断一个变量是否存在然后再使用，但是如果这个变量未声明就会报错,通过 typeof 的安全防范机制（阻止报错）来检查 undeclared 变量，有时是个不错的办法
### 类型检测
1. typeof 检测数据类型的逻辑运算符
2. instanceof 检测是否为某个类的实例
3. constructor 检测构造函数
4. Object.prototype.toString.call 检测数据类型的
`typeof`的返回结果都是字符串，局限性是一是null -> "object"，二是不能细分对象类型（普通对象或是数组对象都是Object）
`题` 
```js
typeof typeof typeof [1,2,3] // "string"
```
## 值

### 数组

使用 delete 运算符可以将单元从数组中删除，但是请注意，单元删除后，数
组的 length 属性并不会发生变化
```js
var arr = [1,2,3]
delete arr[0]  // 返回true
console.log(arr) //  [undefined,2,3]  chrome控制台显示 [empty,2,3]
```
`稀疏数组`含有空白单元或空缺单元的数组
```js
var a = [ ];
a[0] = 1;
// 此处没有设置a[1]单元
a[2] = [ 3 ];
a[1]; // undefined
a.length; // 3

//chrome控制台显示  [1, empty, Array(1)]
```
**a[1] 的值为 undefined，但这与将其显式赋值为 undefined（a[1] =undefined）是有区别的** :point_right::point_right::point_right:[详情](#Array)

数组通过数字进行索引，但有趣的是它们也是对象，所以也可以包含字符串键值和属性（但这些并不计算在数组长度内）
```js
var a = [ ];
a[0] = 1;
a["foobar"] = 2;
a.length; // 1
a["foobar"]; // 2
a.foobar; // 2
```
如果字符串键值能够被强制类型转换为十进制数字的话，它
就会被当作数字索引来处理。

### 字符串

字符串经常被当成字符数组。字符串的内部实现究竟有没有使用数组并不好说，但
JavaScript 中的字符串和字符数组并不是一回事，最多只是看上去相似而已。
* JavaScript 中字符串是不可变的，而数组是可变的,字符串不可变是指字符串的成员函数不会改变其原始值，而是创建并返回一个新的字符
串。而数组的成员函数都是在其原始值上进行操作。
```js
var str= "abc"
str.toUpperCase()
"ABC"
str
"abc"
```
* 许多数组函数用来处理字符串很方便。虽然字符串没有这些函数，但可以通过“借用”数组的非变更方法来处理字符串
```js
Array.prototype.reverse.call( a )
//一个变通（破解）的办法是先将字符串转换为数组，待处理完后再将结果转换回字符串：
var c = a
 // 将a的值转换为字符数组 ["s","t",r"]
 .split( "" )
 // 将数组中的字符进行倒转
 .reverse()
 // 将数组中的字符拼接回字符串
 .join( "" );
```

### 数字

#### 特殊的值
`null` 指曾经赋过值 目前没有值
`undefined`指从未赋值
null 是一个特殊关键字，不是标识符，我们不能将其当作变量来使用和赋值。然而undefined 却是一个标识符，可以被当作变量来使用和赋值

#### 特殊的数字
**`Nan`和`无穷数`都属于number类型**  
1. `NaN`指‘不是一个数字’，将它理解为“无效数值”“失败数值”或者“坏数值”可能更准确些。
NaN 是一个特殊值，它和谁都不相等包括自身也不相等，是唯一一个非自反（即 x === x 不成立）的值。而 NaN != NaN 为 true，
用` Number.isNaN(..)`
2. 无穷数
```js
var a = 1 / 0; // Infinity
var b = -1 / 0; // -Infinity
Infinity/ Infinity // NaN
1/Infinity //0 因为js中并没有无穷小的概念，所以数学方法中的无穷小=1/无穷大的概念行不通
```
3. 零值
javascript中的 0 值判断有许多坑，比如当你判断一个对象中某个key是否有值，你可能会这样写：
```js
if(obj[key]) {
  // do sth.
}
```
但如果这个key所对应的值是 0，那么你就被坑了，因为在 if 判断中，0 相当于 false，因此大括号中的语句并不会如预想那样执行

```js
let v = arr[n] * -1; // 若此时 v === -0
if(v < 0) { // 判断结果为 false
  // do sth.
}
```
如何判断一个数字的值为 -0 还是 +0 
**解决办法**
`商值法`
```js
 n = Number( n );
 return (n === 0) && (1 / n === -Infinity);
}
isNegZero( -0 ); // true
isNegZero( 0 / -3 ); // true
isNegZero( 0 ); // false
```
#### 特殊的等式
`NaN ≠ NaN`
`+0 = -0`

Object.is(...)来判断两个值是否绝对相等解决上面两问题

```js
var a = 2 / "foo";
var b = -3 * 0;
Object.is( a, NaN ); // true
Object.is( b, -0 ); // true
Object.is( b, 0 ); // false
```
能使用 == 和 ===（参见第 4 章）时就尽量不要使用 Object.is(..)，因为前者效率更高、
更为通用。Object.is(..) 主要用来处理那些特殊的相等比较

#### 值和引用
简单标量基本类型值(字符串和数字等)通过值复制来赋值 / 传递, 而复合值(对象等) 通过引用复制来赋值 / 传递。 JavaScript 中的引用和其他语言中的引用 / 指针不同,它们不 能指向别的变量 / 引用,`只能指向值`

```js
 x.push( 4 );
 x; // [1,2,3,4]
 // 然后
 x = [4,5,6];
 x.push( 7 );
 x; // [4,5,6,7]
}
var a = [1,2,3];
foo( a );
a; // 是[1,2,3,4]，不是[4,5,6,7]
```
我们向函数传递 a 的时候，实际是将引用 a 的一个复本赋值给 x，而 a 仍然指向 [1,2,3]。
在函数中我们可以通过引用 x 来更改数组的值（push(4) 之后变为 [1,2,3,4]）。但 x = 
[4,5,6] 并不影响 a 的指向，所以 a 仍然指向 [1,2,3,4]。
我们不能通过引用 x 来更改引用 a 的指向，只能更改 a 和 x 共同指向的值

**`堆内存和栈内存`**
```js
/*百度面试题*/
let a = 12;
let b = a;
b = 13;
console.log(a);

let a = {n:12};
let b = a;
b['n'] = 13;
console.log(a.n);

let a = {n:12};
let b = a;
b = {n:13};
console.log(a.n);
```
![](https://resource.limeili.co/image/20200311152012.png)

 :watermelon: :pineapple: :kiwi_fruit: :strawberry:[几道面试题让你更深次理解浏览器堆栈内存的底层处理机制](../browser/浏览器堆栈内存.md)

## 原生函数

常用的原生函数有：
• String()
• Number()
• Boolean()
• Array()
• Object()
• Function()
• RegExp()
• Date()
• Error()
• Symbol()——ES6 中新加入的！
实际上，它们就是内建函数。

```js
var a = new String( "abc" );
typeof a; // 是"object"，不是"String"
a instanceof String; // true
Object.prototype.toString.call( a ); // "[object String]
```
通过构造函数（如 new String("abc")）创建出来的是封装了基本类型值（如 "abc"）的`封装对象`,而非基本类型值“abc”

### 内部属性
所有 typeof 返回值为 "object" 的对象（如数组）都包含一个内部属性 [[Class]]（我们可
以把它看作一个内部的分类，而非传统的面向对象意义上的类）。这个属性无法直接访问，
一般通过 Object.prototype.toString(..) 来查看
```js
Object.prototype.toString.call( [1,2,3] );
// "[object Array]"
Object.prototype.toString.call( /regex-literal/i );
// "[object RegExp]
```
虽然 Null() 和 Undefined() 这样的原生构造函数并不存在，但是内部 [[Class]] 属性值仍
然是 "Null" 和 "Undefined"。

其他基本类型值（如字符串、数字和布尔）的情况有所不同，通常称为“包装”
中基本类型值被各自的封装对象自动包装，所以它们的内部 [[Class]] 属性值分别为
"String"、"Number" 和 "Boolean"。

### 封装对象包装

封 装 对 象（object wrapper） 扮 演 着 十 分 重 要 的 角 色。 由 于 基 本 类 型 值 没 有 .length
和 .toString() 这样的属性和方法，需要通过封装对象才能访问，此时 JavaScript 会自动为
基本类型值包装（box 或者 wrap）一个封装对象

** new Boolean( false ) 的结果是true    Boolean(false)是false**

### 封装对象的拆封

如果想要得到封装对象中的基本类型值，可以使用 valueOf() 函数
```js
var a = new String( "abc" );
var b = new Number( 42 );
var c = new Boolean( true );
a.valueOf(); // "abc"
b.valueOf(); // 42
c.valueOf(); // true
```
### 原生函数作为构造函数
关于数组（array）、对象（object）、函数（function）和正则表达式，我们通常喜欢以常
量的形式来创建它们。实际上，使用常量和使用构造函数的效果是一样的（创建的值都是
通过封装对象来包装）。
如前所述，应该尽量避免使用构造函数，除非十分必要，因为它们经常会产生意想不到的
结果。

#### Array 
<span id="Array"></span>
构造函数 Array(..) 不要求必须带 new 关键字。不带时，它会被自动补上。
因此 Array(1,2,3) 和 new Array(1,2,3) 的效果是一样的

Array 构造函数只带一个数字参数的时候，该参数会被作为数组的预设长度（length），而
非只充当数组中的一个元素。更为关键的是，数组并没有预设长度这个概念。这样创建出来的只是一个空数组，只不过它的 length 属性被设置成了指定的值,我们将包含至少一个“空单元”的数组称为“稀疏数组”。
```js
var a = new Array( 3 );
a.length; // 3
a 
```
在chrome中显示的是 ` [empty × 3]`  以前是 ` [undefined × 3]`

```js
var a = new Array( 3 );
var b = [ undefined, undefined, undefined ];
var c = [];
c.length = 3;
```
::: tip
* 只要将 length 属性设置为超过实际单元数的值，就能隐式地制造出空单元
* 外还可以通过 delete b[1] 在数组 b 中制造出一个空单元。
:::

以前 a和c在chrome上显示 `[undefined × 3]` 现在` [empty × 3]`
a 和 b 的行为有时相同，有时又大相径庭
```js
a.join( "-" ); // "--"
b.join( "-" ); // "--"
a.map(function(v,i){ return i; }); // [ empty x 3 ]
b.map(function(v,i){ return i; }); // [ 0, 1, 2 ]
```
a.map(..) 之所以执行失败，是因为数组中并不存在任何单元，所以 map(..) 无从遍历。而
join(..) 却不一样，它的具体实现可参考下面的代码：
```js
function fakeJoin(arr,connector) {
 var str = "";
 for (var i = 0; i < arr.length; i++) {
 if (i > 0) {
 str += connector;
 }
 if (arr[i] !== undefined) {
 str += arr[i];
 } 
 }
 return str; 
}
var a = new Array( 3 );
fakeJoin( a, "-" ); // "--"
```
从中可以看出，join(..) 首先假定数组不为空，然后通过 length 属性值来遍历其中的元
素。而 map(..) 并不做这样的假定，因此结果也往往在预期之外，并可能导致失败
**MDN中map的描述**
map 方法会给原数组中的每个元素都按顺序调用一次  callback 函数。callback 每次执行后的返回值（包括 undefined）组合起来形成一个新数组。 callback 函数只会在有值的索引上被调用；那些从来没被赋过值或者使用 delete 删除的索引则不会被调用


**我们可以通过下述方式来创建包含 undefined 单元（而非“空单元”）的数组：`var a = Array.apply( null, { length: 3 } )`**
[ undefined, undefined, undefined ]

::: tip
1. apply方法的第一个参数为null或者undefined等价于全局对象（非严格模式）；
2. apply方法的第二个参数{ length: 20 }为类数组；
3. 浏览器环境下等价于window.Array(undefined, undefined, undefined, ...)
4. 从 ECMAScript 第5版开始，可以使用任何种类的类数组对象，就是说只要有一个 length 属性和(0..length-1)范围的整数属性。例如现在可以使用 NodeList 或一个自己定义的类似 {'length': 2, '0': 'eat', '1': 'bananas'} 形式的对象。
5. 该表达式的值是一个长度为3，且每个元素值都被初赋值为undefined的数组（注意此时不是数组元素没有初始化，而是初始化成undefined，这就是跟Array(3)的区别）
:::

#### Object(..)、Function(..) 和 RegExp(..)
除非万不得已，否则尽量不要使用 Object(..)/Function(..)/RegExp(..)

#### Date(..) 和 Error(..)
没有对应的常量形式来作为它们的替代
创建日期对象必须使用 new Date()。Date(..) 可以带参数，用来指定日期和时间，而不带
参数的话则使用当前的日期和时间。
```js
var d1=Date();        //返回一个字符串（string），没有getDate()等日期对象方法 
                      //"Wed Mar 11 2020 22:31:17 GMT+0800 (中国标准时间)"
var d2=new Date();    //返回一日期对象，可以调用getDate()，内容为当前时间
var d3=Date("2000-1-1");//返回一个字符串（string），内容仍旧为当前时间，也就是不受参数影响
var d4=new Date("2000-1-1");//返回一日期对象，可以调用getDate()
```
`new Date().getTime()`获取当前的时间戳，ES5直接用`Date.now()`

#### Symbol
符号是具有唯一性的特殊值（并
非绝对），用它来命名对象属性不容易导致重名。该类型的引入主要源于 ES6 的一些特殊构造，此外符号也可以自行定义
但它比较特殊，不能带 new 关键字，否则会出错

```js
var mysym = Symbol( "my own symbol" );
mysym; // Symbol(my own symbol)
mysym.toString(); // "Symbol(my own symbol)"
typeof mysym; // "symbol"
var a = { };
a[mysym] = "foobar";
Object.getOwnPropertySymbols( a );
// [ Symbol(my own symbol) ]
```

#### 原生原型
原生构造函数有自己的 .prototype 对象，如 Array.prototype、String.prototype，这些对象包含其对应子类型所特有的行为特征。
例如，将字符串值封装为字符串对象之后，就能访问 String.prototype 中定义的方法
String#indexOf(..)
在字符串中找到指定子字符串的位置。
• String#charAt(..)
获得字符串指定位置上的字符。
• String#substr(..)、String#substring(..) 和 String#slice(..)
获得字符串的指定部分。 
• String#toUpperCase() 和 String#toLowerCase()
将字符串转换为大写或小写。
• String#trim()
去掉字符串前后的空格，返回新的字符串。
以上方法并不改变原字符串的值，而是返回一个新字符串。
**借助原型代理，所以所以字符串可以直接访问这些方法**

有些原生原型（native prototype）并非普通对象那么简单
```js
typeof Function.prototype; // "function"
Function.prototype(); // 空函数！

RegExp.prototype.toString(); // "/(?:)/"——空正则表达式
"abc".match( RegExp.prototype ); // [""]

Array.isArray( Array.prototype ); // true
Array.prototype.push( 1, 2, 3 ); // 3
Array.prototype; // [1,2,3]
// 需要将Array.prototype设置回空，否则会导致问题！
Array.prototype.length = 0;

```
**将原型作为默认值**
Function.prototype 是一个函数，RegExp.prototype 是一个正则表达式，而 Array. 
prototype 是一个数组。对未赋值的变量来说，它们是很好的默
认值。
```js
function isThisCool(vals,fn,rx) {
 vals = vals || Array.prototype;
 fn = fn || Function.prototype;
 rx = rx || RegExp.prototype;
 return rx.test(
 vals.map( fn ).join( "" )
 ); 
}
isThisCool(); // true

isThisCool(
 ["a","b","c"],
 function(v){ return v.toUpperCase(); },
 /D/
); // false
```

这种方法的一个好处是 .prototypes 已被创建并且仅创建一次。相反，如果将 []、
function(){} 和 `/(?:)/ `作为默认值，则每次调用 isThisCool(..) 时它们都会被创建一次
（具体创建与否取决于 JavaScript 引擎，稍后它们可能会被垃圾回收），这样无疑会造成内
存和 CPU 资源的浪费。


## 强制类型转换

### 值类型转换

将值从一种类型转换为另一种类型通常称为类型转换（type casting），这是显式的情况；隐
式的情况称为强制类型转换（coercion）
类型转换发生在静态类型语言的编译阶段，而强制类型转换则发生在
动态类型语言的运行时（runtime）。
然而在 JavaScript 中通常将它们统称为强制类型转换，我个人则倾向于用“隐式强制类型
转换”（implicit coercion）和“显式强制类型转换”（explicit coercion）来区分

### 抽象值操作

ES5 规范第 9 节中定义了一些“抽象操作”（即“仅供内部使用的操作”）和转
换规则。

#### Tostring
它负责处理非字符串到字符串的强制类型转换
* 基本类型值的字符串化规则为：null 转换为 "null"，undefined 转换为 "undefined"，true
转换为 "true"。数字的字符串化则遵循通用规则，不过那些极小和极大的
数字使用指数形式：
* 对普通对象来说，除非自行定义，否则 toString()（Object.prototype.toString()）返回
内部属性 [[Class]] 的值，如 "[object Object]"
* 如果对象有自己的 toString() 方法，字符串化时就会调用该方法并
使用其返回值。
* 数组的默认 toString() 方法经过了重新定义，将所有单元字符串化以后再用 "," 连接起
来  `var a = [1,2,3];a.toString(); // "1,2,3"`

**json字符串化**
`JSON.stringify(..) `在将 JSON 对象序列化为字符串时也用到了 ToString,JSON 字符串化并非严格意义上的强制类型转换，因为其中也涉及 ToString 的相
关规则
JSON 字符串化和 toString() 的效果基本相同，只不过序列化的结
果总是字符串,所有`安全的 JSON 值`（JSON-safe）都可以使用 JSON.stringify(..) 字符串化  

```js
JSON.stringify( 42 ); // "42"
JSON.stringify( "42" ); // ""42"" （含有双引号的字符串）
JSON.stringify( null ); // "null"
JSON.stringify( true ); // "true"
```
<span id="json"> </span>

`不安全的Json值`：undefined、function、symbol
（ES6+）和包含循环引用（对象之间相互引用，形成一个无限循环）
JSON.stringify(..) 在对象中遇到 undefined、function 和 symbol 时会自动将其忽略，在
数组中则会返回 null（以保证单元位置不变）。
```js
JSON.stringify( undefined ); // undefined
JSON.stringify( function(){} ); // undefined
JSON.stringify(
 [1,undefined,function(){},4]
); // "[1,null,null,4]"
JSON.stringify(
 { a:2, b:function(){} }
); // "{"a":2}"
```
如果对象中定义了 toJSON() 方法，JSON 字符串化时会首先调用该方法，然后用它的返回
值来进行序列化。
如果要对含有非法 JSON 值的对象做字符串化，或者对象中的某些值无法被序列化时，就
需要定义 toJSON() 方法来返回一个安全的 JSON 值。

**`toJSON()`应该“返回一个能够被字符串化的安全的 JSON 值”，而不是“返回
一个 JSON 字符串”**

向 JSON.stringify(..) 传递一个可选参数 replacer，它可以是数组或者函数，用
来指定对象序列化过程中哪些属性应该被处理，哪些应该被排除，和 toJSON() 很像。
如果 replacer 是一个数组，那么它必须是一个字符串数组，其中包含序列化要处理的对象
的属性名称，除此之外其他的属性则被忽略。
如果 replacer 是一个函数，它会对对象本身调用一次，然后对对象中的每个属性各调用
一次，每次传递两个参数，键和值。如果要忽略某个键就返回 undefined，否则返回指定
的值。
```js
var a = { 
 b: 42,
 c: "42",
 d: [1,2,3] 
};
JSON.stringify( a, ["b","c"] ); // "{"b":42,"c":"42"}"
JSON.stringify( a, function(k,v){
 if (k !== "c") return v;
} );
// "{"b":42,"d":[1,2,3]}"
```
JSON.string 还有一个可选参数 space，用来指定输出的缩进格式。space 为正整数时是指定
每一级缩进的字符数，它还可以是字符串，此时最前面的十个字符被用于每一级的缩进

**JSON.stringify(..) 并不是强制类型转换。在这里介绍是因为它涉及 ToString 强制类型转换，具体表现在以下两点**
::: tip
*  字符串、数字、布尔值和 null 的 JSON.stringify(..) 规则与 ToString 基本相同。
* 如果传递给 JSON.stringify(..) 的对象中定义了 toJSON() 方法，那么该方法会在字符
串化前调用，以便将对象转换为安全的 JSON 值。
:::


#### ToNumber

`true →  1` 
`false → 0` 
`undefined → NaN` 
`null → 0`
* ToNumber 对字符串的处理基本遵循数字常量的相关规则。处理失败
时返回 NaN（处理数字常量失败时会产生语法错误）。不同之处是 ToNumber 对以 0 开头的
十六进制数并不按十六进制处理
* 如果字符串是空的（不包含任何字符），则将其转换为0
* 对象(包括数组)首先会被转换为基本类型，如果返回的是非数字的基本类型
值，则再遵循以上规则将其强制转换为数字  
为了将值转换为相应的基本类型值，抽象操作 `ToPrimitive`会首先
（通过内部操作 DefaultValue）检查该值是否有 valueOf() 方法。
如果有并且返回基本类型值，就使用该值进行强制类型转换。如果没有就使用 toString()
的返回值（如果存在）来进行强制类型转换。  
如果 valueOf() 和 toString() 均不返回基本类型值，会产生 TypeError 错误。
```js
Number( "" ); // 0
Number( [] ); // 0
Number( [ "abc" ] ); // NaN
```
**使用 Object.create(null) 创建的对象 [[Prototype]] 属性为 null，并且没
有 valueOf() 和 toString() 方法，因此无法进行强制类型转换。**

#### ToBoolean
1. 假值

• undefined
• null
• false
• +0、-0 和 NaN
• ""
假值的布尔强制类型转换结果为 false。  

2. 假值对象

```js
var a = new Boolean( false );//true
var b = new Number( 0 );//true
var c = new String( "" );//true
```

3. 真值
除假值之外的
```js
var a = "false";
var b = "0";
var c = "''"
```
但所有字符串都是真值。不过 "" 除外，因为它是假值列表中唯一的字符串。

### 显示强制类型转换

#### 字符串和数字之间
字符串和数字之间的转换是通过 String(..) 和 Number(..) 这两个内建函来实现的，请注意它们前面没有 new 关键字，并不创建封装对象  
String(..) 遵循前面讲过的 ToString 规则，将值转换为字符串基本类型。Number(..) 遵循
前面讲过的 ToNumber 规则，将值转换为数字基本类型。

```js
var a = 42;
var b = a.toString();
var c = "3.14";
var d = +c;
b; // "42"
d; // 3.14
```
`a.toString()` 是显式的，不过其中涉及隐式转换。因为
toString() 对 42 这样的基本类型值不适用，所以 JavaScript 引擎会自动为 42 创建一个封
装对象，然后对该对象调用 toString()。这里显式转换中含有隐式转换。
`+c` 是 + 运算符的一元（unary）形式（即只有一个操作数）。+ 运算符显式地将 c 转
换为数字，而非数字加法运算,也不是字符串拼接
**在 JavaScript 开源社区中，一元运算 + 被普遍认为是显式强制类型转换**  

1. 日期显式转换为数字
我们常用下面的方法来获得当前的时间戳，例如：
`var timestamp = +new Date()`
或许使用更显式的方法会更
好一些：  
`var timestamp = new Date().getTime()`  
不过最好还是使用 ES5 中新加入的静态方法
`var timestamp = Date.now()`

**不建议对日期类型使用强制类型转换，应该使用 Date.now() 来获得当前的时间戳，使用 new Date(..).getTime() 来获得指定时间的时间戳**

2. 奇特的 ~ 运算符
`~x 大致等同于 -(x+1)`。很奇怪，但相对更容易说明问题：
`~42// -(42+1) ==> -43`  
在 -(x+1) 中唯一能够得到 0（或者严格说是 -0）的 x 值是 -1。也就是说如果 x 为 -1 时，~
和一些数字值在一起会返回假值 0，其他情况则返回真值。  
-1 是一个“哨位值”，JavaScript 中字符串的 indexOf(..) 方法也遵循这一惯例，该方法在字符串中搜索指定的子
字符串，如果找到就返回子字符串所在的位置（从 0 开始），否则返回 -1
```js
var a = "Hello World";
if (a.indexOf( "lo" ) >= 0) { // true
 // 找到匹配！
}
if (a.indexOf( "lo" ) != -1) { // true
 // 找到匹配！
}
if (a.indexOf( "ol" ) < 0) { // true
 // 没有找到匹配！
}
if (a.indexOf( "ol" ) == -1) { // true
 // 没有找到匹配！
}
```
`>= 0 和 == -1` 这样的写法不是很好，称为“抽象渗漏”，意思是在代码中暴露了底层的实现细节，这里是指用 -1 作为失败时的返回值，这些细节应该被屏蔽掉
**~ 和 indexOf() 一起可以将结果强制类型转换（实际上仅仅是转换）为真 / 假值**
```js
var a = "Hello World";
~a.indexOf( "lo" ); // -4 <-- 真值!
if (~a.indexOf( "lo" )) { // true
 // 找到匹配！
}
~a.indexOf( "ol" ); // 0 <-- 假值!
!~a.indexOf( "ol" ); // true
if (!~a.indexOf( "ol" )) { // true
 // 没有找到匹配！
}
```
3. 字位截除

#### 显示解析数字字符串
解析字符串中的数字和将字符串强制类型转换为数字的返回结果都是数字。但解析和转换
两者之间还是有明显的差别
```js
var a = "42"
var b = "42px"
Number( a ); // 42
parseInt( a ); // 42
Number( b ); // NaN
parseInt( b ); // 42
```
**解析允许字符串中含有非数字字符，解析按从左到右的顺序，如果遇到非数字字符就停止。而转换不允许出现非数字字符，否则会失败并返回 NaN。**
解析和转换之间不是相互替代的关系。它们虽然类似，但各有各的用途。如果字符串右边的非数字字符不影响结果，就可以使用解析。而转换要求字符串中所有的字符都是数字，像 "42px" 这样的字符串就不行。

不要忘了 parseInt(..) 针对的是字符串值。向 parseInt(..) 传递数字和其他类型的参数是没有用的，比如 true、function(){...} 和 [1,2,3]。
**非字符串参数会首先被强制类型转换为字符串**，依赖这样的隐式强制类型
转换并非上策，应该避免向 parseInt(..) 传递非字符串参数。
parseInt( 1/0, 19 ); // 18
***
***
***
***
2020-05-12 增  
#### 把其他类型转换为数字的方法
* 强转换（基于底层级制转换）`Number([value])`
  * 一些隐式的转换都是基于Number完成的
    * isNaN('12px')先把其他类型值转换为数字再检测
    * 数学运算 '12px'-13
    * 字符串==数字 两个等号比较很多时候是要把其他值转换成数字
* 弱转换（基于一些额外的方法转换） `parseInt([value])` `parseFloat([value])`
`题`
```js
//parseInt 处理的值是字符串，从字符串的左侧开始查找有效数字字符，遇到非有效的停止查找
//如果处理的值不是字符串，需要先转换为字符串
//Number 是直接调用浏览器最底层的数据类型检测机制来完成
// true-1 false-0 null-0 undefind-NaN 字符串中必须保证都是有效数字才会转换为数字，否则都是NaN
parseInt('') // NaN
Number('') //0
isNaN('') //先把''转换成数字（隐式 Number） isNaN（0） false
parseInt(null) //NaN parseInt('null')
Number(null) //0
isNaN(null)//false
parseInt('12px')//12
Number('12px')//NaN
isNaN('12px')//true
parseFloat('1.6px')+parseInt('1.2px')+ typeof parseInt(null) //'2.6number'  1.6+1+ typeof(NaN)  
isNaN(Number(!!Number(parseInt('0.8')))) //false
typeof !parseInt(null) + !isNaN(null)// 'booleantrue'

```
***
***
***
***
`题`
```js
 let res = parseFloat('left:200px')
 if(res===200){alert(200)}
 else if(res===NaN){alert(NaN)}
 eles if(typeof res==='number'){alert('number')} // 'number'
```
#### 显示转换为布尔值
与前面的 String(..) 和 Number(..) 一样，Boolean(..)（不带 new）是显式的 ToBoolean 强
制类型转换，虽然 Boolean(..) 是显式的，但并不常用
**和前面讲过的 + 类似，一元运算符 ! 显式地将值强制类型转换为布尔值。但是它同时还将
真值反转为假值（或者将假值反转为真值）。所以显式强制类型转换为布尔值最常用的方
法是 !!，因为第二个 ! 会将结果反转回原值**
```js
var a = "0";
var b = [];
var c = {};
var d = "";
var e = 0;
var f = null;
var g;
Boolean( a ); // true
Boolean( b ); // true
Boolean( c ); // true
Boolean( d ); // false
Boolean( e ); // false
Boolean( f ); // false
Boolean( g ); // false
```
 if(..).. 这样的布尔值上下文中，如果没有使用 Boolean(..) 和 !!，就会自动隐式地进
行 ToBoolean 转换。建议使用 Boolean(..) 和 !! 来进行显式转换以便让代码更清晰易读
`var a =42`
`var b = a ? true : false;`
表面上这是一个显式的 ToBoolean 强制类型转换，因为返回结果是 true 或者 false。
然而这里涉及隐式强制类型转换，因为 a 要首先被强制类型转换为布尔值才能进行条件判
断。这种情况称为“显式的隐式”，有百害而无一益，我们应彻底杜绝。
建议使用 Boolean(a) 和 !!a 来进行显式强制类型转换

### 隐式强制类型转换

#### 字符串和数字之间的隐式强制类型转换
**加法运算**
```js
var a = [1,2];
var b = [3,4];
a + b; // "1,23,4
```
简单来说就是，如果 + 的其中一个操作数是字符串（或者通过ToPrimitive可以得到字符串），
则执行字符串拼接；否则执行数字加法。
```js
1 + '1' // '11'
true + true // 2
4 + [1,2,3] // "41,2,3"
```
* 如果有一个操作数是NaN, 则结果是NaN；
* Infinity 加 Infinity 结果是 Infinity；
* -Infinity 加 -Infinity 结果是 -Infinity；
* Infinity 加 -Infinity 结果是NaN；
* +0 加 +0 结果是+0；
* -0 加 -0 结果是 -0；
* +0 加 -0 结果是+0

**腾讯面试题**
```js
let result = 1+null+true+undefined+'Tencent'+false+[]+undefined+null;
console.log(result); //"NaNTencentfalseundefinednull"

let result = 10+ false + undefind + [] +'Tencent'+null +true +{}
//'NaNTencentnulltrue[object Object]'

console.log([]==false); //true
console.log(![]==false); //true
```
**`[]==![]`** :point_right::point_right::point_right:[详情](#2)
::: tip
1. [] + {}
根据其中一个操作数可以通过ToPrimitive得到字符串，执行字符串拼接  
`[] 转换成 ""`  
`{} 转换成 "[Object Object]"`  
所以最后返回 `"[Object Object]"`  

2. {} + []
特殊情况{} + 头 的相加式，有些浏览器会将{}视为一个块符号，所以不会参与相加，而是把+符号视为转换符（Number）将后面的操作数转换为数值  
所以`{}+[]实际上是+[]`, 即`Number([]) => Number("") => 0`
:::

```js
var a = {
 valueOf: function() { return 42; },
 toString: function() { return 4; }
};
a + ""; // "42"
String( a ); // "4"
```
a + ""（隐式）和前面的 String(a)（显式）之间有一个细微的差别 :  
**根据ToPrimitive 抽象操作规则，a + "" 会对 a 调用 valueOf() 方法，然后通过 ToString 抽象操作将返回值转换为字符串。而 String(a) 则是直接调用 ToString()。**

**减法运算**
```js
var a = "3.14";
var b = a - 0;
b; // 3.14

var a = [3];
var b = [1];
a - b; // 2
// 和 b 都需要被转换为数字，它们首先被转换为字符串（通过toString()），然后再转换为数字
```
#### 布尔值到数字的隐式强制类型转换
```js
function onlyOne(a,b,c) {
 return !!((a && !b && !c) ||
 (!a && b && !c) || (!a && !b && c));
}
var a = true;
var b = false;
onlyOne( a, b, b ); // true
onlyOne( b, a, b ); // true
onlyOne( a, b, a ); // false
```
其中有且仅有一个参数为 true，则 onlyOne(..) 返回 true,但如果有多个参数时（4 个、5 个，甚至 20 个），用上面的代码就很难处理了。这时就可
以使用从布尔值到数字（0 或 1）的强制类型转换  
```js
 var sum = 0;
 for (var i=0; i < arguments.length; i++) {
 // 跳过假值，和处理0一样，但是避免了NaN
 if (arguments[i]) {
 sum += arguments[i];
 }
 }
 return sum == 1;
}
var a = true;
var b = false;
onlyOne( b, a ); // true
onlyOne( b, a, b, b, b ); // true
```
同样的功能也可以通过显式强制类型转换来实现：
```js
function onlyOne() {
 var sum = 0;
 for (var i=0; i < arguments.length; i++) {
 sum += Number( !!arguments[i] );
 }
 return sum === 1;
}
```
#### 　隐式强制类型转换为布尔值

1. if (..) 语句中的条件判断表达式。
2. for ( .. ; .. ; .. ) 语句中的条件判断表达式（第二个）。
3. while (..) 和 do..while(..) 循环中的条件判断表达式。
4. ? : 中的条件判断表达式。
5. 逻辑运算符 ||（逻辑或）和 &&（逻辑与）左边的操作数（作为条件判断表达式）  

以上情况中，非布尔值会被隐式强制类型转换为布尔值，遵循前面介绍过的 ToBoolean 抽
象操作规则。

**`|| 和 &&`**
不太赞同将它们称为“逻辑运算符”，因为这不太准确。称它们为`“选择器运算符”`（selector operators）或者`“操作数选择器运算符”`（operand selector operators）更恰当些。
::: tip
因为和其他语言不同，在 JavaScript 中它们返回的并不是布尔值。它们的返回值是两个操作数中的一个（且仅一个）。即选择两个操作数中的一个，然后返回它的值。
:::

```js
var a = 42;
var b = "abc";
var c = null;
a || b; // 42 
a && b; // "abc"
c || b; // "abc" 
c && b; // null
```
|| 和 && 首先会对第一个操作数（a 和 c）执行条件判断，如果其不是布尔值（如上例）就
先进行 ToBoolean 强制类型转换，然后再执行条件判断
* 对于 || 来说，如果条件判断结果为 true 就返回第一个操作数（a 和 c）的值，如果为
false 就返回第二个操作数（b）的值
* && 则相反，如果条件判断结果为 true 就返回第二个操作数（b）的值，如果为 false 就返
回第一个操作数（a 和 c）的值。

下面是一个十分常见的 || 的用法，
```js
function foo(a,b) {
 a = a || "hello";
 b = b || "world";
 console.log( a + " " + b );
}
foo(); // "hello world"
foo( "yeah", "yeah!" ); // "yeah yeah!
```
再来看看 &&,有一种用法对开发人员不常见，然而 JavaScript 代码压缩工具常用。就是如果第一个操
作数为真值，则 && 运算符“选择”第二个操作数作为返回值，这也叫作“守护运算符”
，即前面的表达式为后面的表达式“把关”：
```js
function foo() {
 console.log( a );
}
var a = 42;
a && foo(); // 42
```
foo() 只有在条件判断 a 通过时才会被调用。如果条件判断未通过，a && foo() 就会悄然
终止（也叫作“短路”，short circuiting），foo() 不会被调用。

#### 符号的强制类型转换
目前我们介绍的显式和隐式强制类型转换结果是一样的，它们之间的差异仅仅体现在代码
可读性方面。  

但 ES6 中引入了符号类型，它的强制类型转换有一个坑，在这里有必要提一下。ES6 允许
从符号到字符串的显式强制类型转换，然而隐式强制类型转换会产生错误
```js
var s1 = Symbol( "cool" );
String( s1 ); // "Symbol(cool)"
var s2 = Symbol( "not cool" );
s2 + ""; // TypeError
```
* 符号不能够被强制类型转换为数字（显式和隐式都会产生错误）
* 可以被强制类型转换
为布尔值（显式和隐式结果都是 true）

### 　宽松相等和严格相等
正确的解释是：`== 允许在相等比较中进行强制类型转换，而 === 不允许。`
有人觉得 == 会比 === 慢，实际上虽然强制类型转换确实要多花点时间，但仅仅是微秒级
（百万分之一秒）的差别而已。
如果进行比较的两个值类型相同，则 == 和 === 使用相同的算法，所以除了 JavaScript 引擎
实现上的细微差别之外，它们之间并没有什么不同。

#### 抽象相等

<span id = "1"></span>
ES5 规范 11.9.3 节的“抽象相等比较算法”定义了 == 运算符的行为。该算法简单而又全
面，涵盖了所有可能出现的类型组合，以及它们进行强制类型转换的方式  
如果两个值的类型相同，就仅比较它们是否相等。例如，42
等于 42，"abc" 等于 "abc"。  
最后定义了对象（包括函数和数组）的宽松相等 ==。两个对象指向同一个值时
即视为相等，不发生强制类型转换。=== 的定义和 11.9.3.1 一样，包括对象的情况。实际上在比较两个对象的时
候，== 和 === 的工作原理是一样的。

有几个非常规的情况需要注意。
• NaN 不等于 NaN
• +0 等于 -0
***
***
2020-05-20 增
**==规律**  

1. 对象= 字符串 对象转化为字符串
2. null==undefind 但和其他值都不相等
3. 剩下两边不同都是转换为数字
***
***
1. 字符串和数字之间的相等比较
```js
var a = 42;
var b = "42";
a === b; // false
a == b; // true
```
::: tip
1. 如果 Type(x) 是数字，Type(y) 是字符串，则返回 x == ToNumber(y) 的结果。
2. 如果 Type(x) 是字符串，Type(y) 是数字，则返回 ToNumber(x) == y 的结果
:::

2. 其他类型和布尔类型之间的相等比较
```js
var a = "42";
var b = true;
a == b; // false
```
::: tip
1. 如果 Type(x) 是布尔类型，则返回 ToNumber(x) == y 的结果；
2. 如果 Type(y) 是布尔类型，则返回 x == ToNumber(y) 的结果。
:::
这里并不涉及 ToBoolean，所以 "42" 是真值还是假值与 == 本身没有关系！
重点是我们要搞清楚 == 对不同的类型组合怎样处理。== 两边的布尔值会被强制类型转换
为数字。

3. null 和 undefined 之间的相等比较
`null = undefined`
**规范中提到， 要比较相等性之前，不能将 null 和 undefined 转换成其他任何值，并且规定null 和 undefined 是相等的**

```js
var a = null;
var b;
a == b; // true
a == null; // true
b == null; // true
a == false; // false
b == false; // false
a == ""; // false
b == ""; // false
a == 0; // false
b == 0; // false
```
**为什么null==0是false**
```js
null > 0? //=>false
null < 0? //=>false
null >= 0?  //=>true
null <= 0?  //=>true
```
* 首先null > 0; 和 null < 0; 的结果是将null转换为数字0来进行的比较判断；  
* null>=0的时候，强转为数字类型。在进行null>=0比较时，它是通过比较null<0得到的答案

* null>0 //null转化为number，为0，所以0>0结果为false  
null>=0 //null转化为number，为0>=0，所以结果为true  
null==0// null在做相等判断时，不进行转型，所以null和0为不同类型数据，结果为false。

4. 对象和非对象之间的相等比较
::: tip
1. 如果 Type(x) 是字符串或数字，Type(y) 是对象，则返回 x == ToPrimitive(y) 的结果；
2. 如果 Type(x) 是对象，Type(y) 是字符串或数字，则返回 ToPromitive(x) == y 的结果
3. 这里只提到了字符串和数字，没有布尔值。原因是我们之前介绍过规定了布尔值会先被强制类型转换为数字
:::
```js
var a = "abc";
var b = Object( a ); // 和new String( a )一样
a === b; // false
a == b; // true
```
a == b 结果为 true，因为 b 通过 ToPromitive 进行强制类型转换（也称为“拆封”，英文
为 unboxed 或者 unwrapped），并返回标量基本类型值 "abc"，与 a 相等。

```js
var a = null;
var b = Object( a ); // 和Object()一样
a == b; // false
var c = undefined; 
var d = Object( c ); // 和Object()一样
c == d; // false
var e = NaN; 
var f = Object( e ); // 和new Number( e )一样
e == f; // false
```
因为没有对应的封装对象，所以 null 和 undefined 不能够被封装（boxed），Object(null)
和 Object() 均返回一个常规对象。
NaN 能够被封装为数字封装对象，但拆封之后 NaN == NaN 返回 false，因为 NaN 不等于 NaN

#### 比较少见的情况
1. 返回其他数字
```js
Number.prototype.valueOf = function() {
 return 3;
};
new Number( 2 ) == 3; // true
```
还有更奇怪的情况：
`if (a == 2 && a == 3) {// ..}`
你也许觉得这不可能，因为 a 不会同时等于 2 和 3。但“同时”一词并不准确，因为 a == 2 在 a == 3 之前执行
```js
var i = 2;
Number.prototype.valueOf = function() {
 return i++;
};
var a = new Number( 42 );
if (a == 2 && a == 3) {
 console.log( "Yep, this happened." );
}
```
2. 假值的相等比较

```js
"0" == null; // false
"0" == undefined; // false
"0" == false; // true -- 晕！
"0" == NaN; // false
"0" == 0; // true
"0" == ""; // false
false == null; // false
false == undefined; // false
false == NaN; // false
false == 0; // true -- 晕！
false == ""; // true -- 晕！
false == []; // true -- 晕！
false == {}; // false
"" == null; // false
"" == undefined; // false
"" == NaN; // false
"" == 0; // true -- 晕！
"" == []; // true -- 晕！
"" == {}; // false
0 == null; // false
0 == undefined; // false
0 == NaN; // false
0 == []; // true -- 晕！
0 == {}; // false
```
而有 7 种我们注释了“晕！”，因为它们属于假阳（false positive）的情况

3. 极端情况
<span id="2"></span>
`[] == ![] // true`
让我们看看 ! 运算符都做了些什么？根据 ToBoolean 规则，它会进行布尔
值的显式强制类型转换（同时反转奇偶校验位）。所以 [] == ![] 变成了 [] == false

`2 == [2]; // true`
`"" == [null]; // true`

4. 完整性检查
再来看看那些“短”的地方：
```js
"0" == false; // true -- 晕！
false == 0; // true -- 晕！
false == ""; // true -- 晕！
false == []; // true -- 晕！
"" == 0; // true -- 晕！
"" == []; // true -- 晕！
0 == []; // true -- 晕！
```
其中有 4 种情况涉及 == false，之前我们说过应该避免，应该不难掌握。
现在剩下 3 种：
```js
"" == 0; // true -- 晕！
"" == []; // true -- 晕！
0 == []; // true -- 晕！
```
正常情况下我们应该不会这样来写代码。我们应该不太可能会用 == [] 来做条件判断，而
是用 == "" 或者 == 0，如
```js
function doSomething(a) {
 if (a == "") {
 // .. 
 }
}
```
如果不小心碰到 doSomething(0) 和 doSomething([]) 这样的情况

5.  安全运用隐式强制类型转换
**两个原则**
• 如果两边的值中有 true 或者 false，千万不要使用 ==。
• 如果两边的值中有 []、"" 或者 0，尽量不要使用 ==。

这时最好用 === 来避免不经意的强制类型转换。这两个原则可以让我们避开几乎所有强制
类型转换的坑。  
这种情况下强制类型转换越显式越好，能省去很多麻烦。  
所以 == 和 === 选择哪一个取决于是否允许在相等比较中发生强制类型转换。  
强制类型转换在很多地方非常有用，能够让相等比较更简洁（比如 null 和 undefined  
隐式强制类型转换在部分情况下确实很危险，这时为了安全起见就要使用 ===
::: tip
有一种情况下强制类型转换是绝对安全的，那就是 typeof 操作。typeof 总是
返回七个字符串之一，其中没有空字符串。所以在类型检查
过程中不会发生隐式强制类型转换。typeof x == "function" 是 100% 安全
的，和 typeof x === "function" 一样。事实上两者在规范中是一回事。所
以既不要盲目听命于代码工具每一处都用 ===，更不要对这个问题置若罔闻。
我们要对自己的代码负责
:::

### 抽象关系比较
a < b 中涉及的隐式强制类型转换不太引人注意，不过还是很有必要深入了解一下。
ES5 规范 11.8.5 节定义了“抽象关系比较”（abstract relational comparison），分为两个部
分：比较双方都是字符串（后半部分）和其他情况（前半部分）。  
比较双方首先调用 ToPrimitive，如果结果出现非字符串，就根据 ToNumber 规则将双方强
制类型转换为数字来进行比较。
```js
var a = [ 42 ];
var b = [ "43" ]
a < b; // true
```
如果比较双方都是字符串，则按字母顺序来进行比较：
```js
var a = [ "42" ];
var b = [ "043" ];
a < b; // false
```
a 和 b 并没有被转换为数字，因为 ToPrimitive 返回的是字符串，所以这里比较的是 "42" 和 "043" 两个字符串，它们分别以 "4" 和 "0" 开头。因为 "0" 在字母顺序上小于 "4"，所以
最后结果为 false

```js
var a = [ 4, 2 ];
var b = [ 0, 4, 3 ];
a < b; // false  a 转换为 "4, 2"，b 转换为 "0, 4, 3"，
```
```js
var a = { b: 42 };
var b = { b: 43 };
a < b; // false  为 a 是 [object Object]，b 也是 [object Object]
```

**注意**
```js
var a = { b: 42 };
var b = { b: 43 };
a < b; // false
a == b; // false
a > b; // false
a <= b; // true
a >= b; // true
```
为什么 a == b 的结果不是 true ？它们的字符串值相同（同为 "[object Object]"），按道
理应该相等才对？实际上不是这样 
:point_right::point_right::point_right:[详情](#1)  
但是如果 a < b 和 a == b 结果为 false，为什么 a <= b 和 a >= b 的结果会是 true 呢？ 

`因为根据规范 a <= b 被处理为 b < a，然后将结果反转。因为 b < a 的结果是 false，所以 a <= b 的结果是 true。`
这可能与我们设想的大相径庭，即 `<=` 应该是“小于或者等于”。实际上 JavaScript 中 <= 是
`“不大于”`的意思

相等比较有严格相等，关系比较却没有“严格关系比较”（strict relational comparison）。也
就是说如果要避免 a < b 中发生隐式强制类型转换，我们只能确保 a 和 b 为相同的类型，
除此之外别无他法。

