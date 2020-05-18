---
title: 《你不知道的javascript(上)》this全面解析
date: 2020-03-09
tags:
 - 你不知道的javascript
categories:
 - JavaScript
sidebar: auto
---
![](https://resource.limeili.co/abstract/abstract%20(5).jpg)
<!-- more -->
## 调用位置

寻找调用位置就是寻找“函数被调用的位置”，最重要的是要分析`调用栈（就是为了到达当前执行位置所调用的所有函数）`。我们关心的 **调用位置就在当前正在执行的函数的前一个调用中**  
```js
function baz() {
    // 当前调用栈是：baz
    // 因此，当前调用位置是全局作用域
    
    console.log( "baz" );
    bar(); // <-- bar的调用位置
}

function bar() {
    // 当前调用栈是：baz --> bar
    // 因此，当前调用位置在baz中
    
    console.log( "bar" );
    foo(); // <-- foo的调用位置
}

function foo() {
    // 当前调用栈是：baz --> bar --> foo
    // 因此，当前调用位置在bar中
    
    console.log( "foo" );
}

baz(); // <-- baz的调用位置
```
## 绑定规则
你必须找到调用位置，然后判断需要应用下面四条规则中的哪一条
### 默认绑定
* 独立函数调用  
可以把默认绑定看作是无法应用其他规则时的默认规则，this指向全局对象  
如果使用严格模式（strict mode），那么全局对象将无法使用默认绑定，因此 this 会绑定 到 undefined：
```js
function foo() { // 运行在严格模式下，this会绑定到undefined
    "use strict";
    
    console.log( this.a );
}

var a = 2;

// 调用
foo(); // TypeError: Cannot read property 'a' of undefined
```
但严格模式下调用函数则不影响默认绑定
```js

function foo() { // 运行
    console.log( this.a );
}

var a = 2;

(function() { // 严格模式下调用函数则不影响默认绑定
    "use strict";
    
    foo(); // 2
})();
```
### 隐式绑定
当函数引用有上下文对象时，隐式绑定规则会把函数中的this绑定到这个上下文对象。对象属性引用链中只有上一层或者说最后一层在调用中起作用。
```js
function foo() {
    console.log( this.a );
}

var obj = {
    a: 2,
    foo: foo
};

obj.foo(); // 2
```
`隐式丢失`
1. 被隐式绑定的函数特定情况下会丢失绑定对象，应用默认绑定，把this绑定到全局对象或者undefined上。
```js
// 虽然bar是obj.foo的一个引用，但是实际上，它引用的是foo函数本身。
// bar()是一个不带任何修饰的函数调用，应用默认绑定。
function foo() {
    console.log( this.a );
}

var obj = {
    a: 2,
    foo: foo
};

var bar = obj.foo; // 函数别名

var a = "oops, global"; // a是全局对象的属性

bar(); // "oops, global"
```
2. 参数传递就是一种隐式赋值，传入函数时也会被隐式赋值。回调函数丢失this绑定是非常常见的。
```js
function foo() {
    console.log( this.a );
}

function doFoo(fn) {
    // fn其实引用的是foo
    
    fn(); // <-- 调用位置！
}

var obj = {
    a: 2,
    foo: foo
};

var a = "oops, global"; // a是全局对象的属性

doFoo( obj.foo ); // "oops, global"
```
3. 果把函数传入语言内置的函数而不是传入你自己声明的函数，会发生什么呢？结果是一 样的，没有区别
```js
function foo() {
    console.log( this.a );
}
var obj = {
    a: 2,
    foo: foo
};

var a = "oops, global";
setTimeout( obj.foo, 100 ); // "oops, global


// JS环境中内置的setTimeout()函数实现和下面的伪代码类似：
function setTimeout(fn, delay) {
    // 等待delay毫秒
    fn(); // <-- 调用位置！
}
```
### 显示绑定
在分析隐式绑定时，我们必须在一个对象内部包含一个指向函 数的属性，并通过这个属性间接引用函数，从而把 this 间接（隐式）绑定到这个对象上。  
通过`call(..)` 或者 `apply(..)`方法。第一个参数是一个对象，在调用函数时将这个对象绑定到this。因为直接指定this的绑定对象，称之为显示绑定
```js
function foo() {
    console.log( this.a );
}

var obj = {
    a: 2
};

foo.call( obj ); // 2  调用foo时强制把foo的this绑定到obj上
```
显示绑定无法解决丢失绑定问题。  
`解决办法`
1. 硬绑定
创建函数bar()，并在它的内部手动调用foo.call(obj)，强制把foo的this绑定到了obj。。无论之后如何调用函数 bar，它 总会手动在 obj 上调用 foo。这种绑定是一种显式的强制绑定，因此我们称之为硬绑定。
```js
function foo() {
    console.log( this.a );
}

var obj = {
    a: 2
};

var bar = function() {
    foo.call( obj );
};

bar(); // 2
setTimeout( bar, 100 ); // 2

// 硬绑定的bar不可能再修改它的this
bar.call( window ); // 2
```
典型应用场景是创建一个包裹函数，负责接收参数并返回值
```js
function foo(something) {
    console.log( this.a, something );
    return this.a + something;
}

var obj = {
    a: 2
};

var bar = function() {
    return foo.apply( obj, arguments );
};

var b = bar( 3 ); // 2 3
console.log( b ); // 5
```
创建一个可以重复使用的辅助函数。
```js
function foo(something) {
    console.log( this.a, something );
    return this.a + something;
}

// 简单的辅助绑定函数
function bind(fn, obj) {
    return function() {
        return fn.apply( obj, arguments );
    }
}

var obj = {
    a: 2
};

var bar = bind( foo, obj );

var b = bar( 3 ); // 2 3
console.log( b ); // 5
```
ES5内置了Function.prototype.bind，bind会返回一个硬绑定的新函数，用法如下。
```js
function foo(something) {
    console.log( this.a, something );
    return this.a + something;
}

var obj = {
    a: 2
};

var bar = foo.bind( obj );

var b = bar( 3 ); // 2 3
console.log( b ); // 5
```
2. API调用的“上下文”

JS许多内置函数提供了一个可选参数，被称之为“上下文”（context），其作用和bind(..)一样，确保回调函数使用指定的this。这些函数实际上通过call(..)和apply(..)实现了显式绑定。

```js
function foo(el) {
	console.log( el, this.id );
}

var obj = {
    id: "awesome"
}

var myArray = [1, 2, 3]
// 调用foo(..)时把this绑定到obj
myArray.forEach( foo, obj );
// 1 awesome 2 awesome 3 awesome
```
### new绑定
* 在JS中，构造函数只是使用new操作符时被调用的普通函数，他们不属于某个类，也不会实例化一个类。
* 包括内置对象函数（比如Number(..)）在内的所有函数都可以用new来调用，这种函数调用被称为构造函数调用。
* 实际上并不存在所谓的“构造函数”，只有对于函数的`“构造调用”`。
使用new来调用函数，或者说发生构造函数调用时，会自动执行下面的操作。
1. 创建（或者说构造）一个新对象。
2. 这个新对象会被执行[[Prototype]]连接。
3. 这个新对象会绑定到函数调用的this。
4. 如果函数没有返回其他对象，那么new表达式中的函数调用会自动返回这个新对象。

`手写一个new`
```js
function create() {
	// 创建一个空的对象
    var obj = new Object(),
	// 获得构造函数，arguments中去除第一个参数
    Con = [].shift.call(arguments);
	// 链接到原型，obj 可以访问到构造函数原型中的属性
    obj.__proto__ = Con.prototype;
	// 绑定 this 实现继承，obj 可以访问到构造函数中的属性
    var ret = Con.apply(obj, arguments);
	// 优先返回构造函数返回的对象
	return ret instanceof Object ? ret : obj;
};
```
1. 用new Object()的方式新建了一个对象obj

2. 取出第一个参数，就是我们要传入的构造函数。此外因为 shift 会修改原数组，所以 arguments会被去除第一个参数

3、将 obj的原型指向构造函数，这样obj就可以访问到构造函数原型中的属性

4、使用apply，改变构造函数this 的指向到新建的对象，这样 obj就可以访问到构造函数中的属性

5、返回 obj

## 优先级

1. 函数是否在 new 中调用（`new 绑定`）？如果是的话 this 绑定的是新创建的对象。 var bar = new foo() 
2. 函数是否通过 call、apply（`显式绑定`）或者`硬绑定`调用？如果是的话，this 绑定的是 指定的对象。 var bar = foo.call(obj2) 
3. 函数是否在某个上下文对象中调用（`隐式绑`定）？如果是的话，this 绑定的是那个上 下文对象。 var bar = obj1.foo() 
4. 如果都不是的话，使用`默认绑定`。如果在严格模式下，就绑定到 undefined，否则绑定到 全局对象。 var bar = foo()

## 绑定例外
### 被忽略的this
把null或者undefined作为this的绑定对象传入call、apply或者bind，这些值在调用时会被忽略，实际应用的是`默认规则`。  

下面两种情况下会传入null  
1. 使用apply(..)来“展开”一个数组，并当作参数传入一个函数
2. bind(..)可以对参数进行柯里化（预先设置一些参数）
```js
function foo(a, b) {
    console.log( "a:" + a + "，b:" + b );
}

// 把数组”展开“成参数
foo.apply( null, [2, 3] ); // a:2，b:3

// 使用bind(..)进行柯里化
var bar = foo.bind( null, 2 );
bar( 3 ); // a:2，b:3 
```
这两种方法都需要传入一个参数当作 this 的绑定对象。如果函数并不关心 this 的话，你 仍然需要传入一个占位值，这时 null 可能是一个不错的选择  
总是传入null来忽略this绑定可能产生一些副作用。如果某个函数确实使用了this，那默认绑定规则会把this绑定到全局对象中。  
`更安全的this`
安全的做法就是传入一个特殊的对象（空对象），把this绑定到这个对象不会对你的程序产生任何副作用。  
:::tip
JS中创建一个空对象最简单的方法是**Object.create(null)**，这个和{}很像，但是并不会创建Object.prototype这个委托，所以比{}更空
:::
```js
function foo(a, b) {
    console.log( "a:" + a + "，b:" + b );
}

// 我们的空对象
var ø = Object.create( null );

// 把数组”展开“成参数
foo.apply( ø, [2, 3] ); // a:2，b:3

// 使用bind(..)进行柯里化
var bar = foo.bind( ø, 2 );
bar( 3 ); // a:2，b:3 
```
### 间接引用
你有可能（有意或者无意地）创建一个函数的“间接引用”，在这 种情况下，调用这个函数会应用默认绑定规则。  
`间接引用最容易在赋值时发生`  
```js
function foo() {
    console.log( this.a );
}

var a = 2;
var o = { a: 3, foo: foo };
var p = { a: 4};

o.foo(); // 3
(p.foo = o.foo)(); // 2
```
赋值表达式 p.foo = o.foo 的返回值是目标函数的引用，因此调用位置是 foo() 而不是 p.foo() 或者 o.foo()。根据我们之前说过的，这里会应用默认绑定。
### 软绑定
* 硬绑定可以把this强制绑定到指定的对象（new除外），防止函数调用应用默认绑定规则。但是会降低函数的灵活性，使用硬绑定之后就无法使用隐式绑定或者显式绑定来修改this。
* 如果给默认绑定指定一个全局对象和undefined以外的值，那就可以实现和硬绑定相同的效果，同时保留隐式绑定或者显示绑定修改this的能力。
```js
// 默认绑定规则，优先级排最后
// 如果this绑定到全局对象或者undefined，那就把指定的默认对象obj绑定到this,否则不会修改this
if(!Function.prototype.softBind) {
    Function.prototype.softBind = function(obj) {
        var fn = this;
        // 捕获所有curried参数
        var curried = [].slice.call( arguments, 1 ); 
        var bound = function() {
            return fn.apply(
            	(!this || this === (window || global)) ? 
                	obj : this,
                curried.concat.apply( curried, arguments )
            );
        };
        bound.prototype = Object.create( fn.prototype );
        return bound;
    };
}
```
使用：软绑定版本的foo()可以手动将this绑定到obj2或者obj3上，但如果应用默认绑定，则会将this绑定到obj。
```js
function foo() {
    console.log("name:" + this.name);
}

var obj = { name: "obj" },
    obj2 = { name: "obj2" },
    obj3 = { name: "obj3" };

// 默认绑定，应用软绑定，软绑定把this绑定到默认对象obj
var fooOBJ = foo.softBind( obj );
fooOBJ(); // name: obj 

// 隐式绑定规则
obj2.foo = foo.softBind( obj );
obj2.foo(); // name: obj2 <---- 看！！！

// 显式绑定规则
fooOBJ.call( obj3 ); // name: obj3 <---- 看！！！

// 绑定丢失，应用软绑定
setTimeout( obj2.foo, 10 ); // name: obj
```
## this词法
ES6新增一种特殊函数类型：箭头函数，箭头函数无法使用上述四条规则，而是根据外层（函数或者全局）作用域（词法作用域）来决定this。
```js
function foo() {
    // 返回一个箭头函数
    return (a) => {
        // this继承自foo()
        console.log( this.a );
    };
}

var obj1 = {
    a: 2
};

var obj2 = {
    a: 3
}

var bar = foo.call( obj1 );
bar.call( obj2 ); // 2，不是3！
```
foo()内部创建的箭头函数会捕获调用时foo()的this。由于foo()的this绑定到obj1，bar(引用箭头函数)的this也会绑定到obj1，箭头函数的绑定无法被修改(new也不行)。  
箭头函数最常用于回调函数中，例如事件处理器或者定时器：
```js
function foo() { setTimeout(() => {  console.log( this.a ); },100); }
var obj = { a:2 };foo.call( obj ); // 2
```
箭头函数可以像 bind(..) 一样确保函数的 this 被绑定到指定对象，此外，其重要性还体 现在它用更常见的词法作用域取代了传统的 this 机制。实际上，在 ES6 之前我们就已经 在使用一种几乎和箭头函数完全一样的模式。
```js
function foo() {
var self = this;  setTimeout( function(){ console.log( self.a ); }, 100 ); }
var obj = { a: 2 };foo.call( obj ); // 2
```
虽然 self = this 和箭头函数看起来都可以取代 bind(..)，但是从本质上来说，它们想替 代的是 this 机制。  
如果你经常编写 this 风格的代码，但是绝大部分时候都会使用 self = this 或者箭头函数 来否定 this 机制，那你或许应当：  
1. 只使用词法作用域并完全抛弃错误 this 风格的代码
2. 完全采用 this 风格，在必要时使用 bind(..)，尽量避免使用 self = this 和箭头函数。  


`对于箭头函数的this总结如下：`

1. 箭头函数不绑定this，箭头函数中的this相当于普通变量。

2. 箭头函数的this寻值行为与普通变量相同，在作用域中逐级寻找。

3. 箭头函数的this无法通过bind，call，apply来直接修改（可以间接修改）。

4. 改变作用域中this的指向可以改变箭头函数的this。

5. eg. function closure(){()=>{//code }}，在此例中，我们通过改变封包环境closure.bind(another)()，来改变箭头函数this的指向
```js
/**
 * 非严格模式
 */

var name = 'window'

var person1 = {
  name: 'person1',
  show1: function () {
    console.log(this.name)
  },
  show2: () => console.log(this.name),
  show3: function () {
    return function () {
      console.log(this.name)
    }
  },
  show4: function () {
    return () => console.log(this.name)
  }
}
var person2 = { name: 'person2' }
person1.show1() // person1，隐式绑定，this指向调用者 person1 
person1.show1.call(person2) // person2，显式绑定，this指向 person2

person1.show2() // window，箭头函数绑定，this指向外层作用域，即全局作用域
person1.show2.call(person2) // window，箭头函数绑定，this指向外层作用域，即全局作用域

person1.show3()() // window，默认绑定，这是一个高阶函数，调用者是window
				  // 类似于`var func = person1.show3()` 执行`func()`
person1.show3().call(person2) // person2，显式绑定，this指向 person2
person1.show3.call(person2)() // window，默认绑定，调用者是window

person1.show4()() // person1，箭头函数绑定，this指向外层作用域，即person1函数作用域
person1.show4().call(person2) // person1，箭头函数绑定，
							  // this指向外层作用域，即person1函数作用域
person1.show4.call(person2)() // person2
```
最后一个person1.show4.call(person2)()有点复杂，我们来一层一层的剥开。  


1. 首先是var func1 = person1.show4.call(person2)，这是显式绑定，调用者是person2，show4函数指向的是person2。
2. 然后是func1()，箭头函数绑定，this指向外层作用域，即person2函数作用域
首先要说明的是，箭头函数绑定中，this指向外层作用域，并不一定是第一层，也不一定是第二层。  

因为没有自身的this，所以只能根据作用域链往上层查找，直到找到一个绑定了this的函数作用域，并指向调用该普通函数的对象

```js
/**
 * 非严格模式
 */

var name = 'window'

function Person (name) {
  this.name = name;
  this.show1 = function () {
    console.log(this.name)
  }
  this.show2 = () => console.log(this.name)
  this.show3 = function () {
    return function () {
      console.log(this.name)
    }
  }
  this.show4 = function () {
    return () => console.log(this.name)
  }
}

var personA = new Person('personA')
var personB = new Person('personB')

personA.show1() // personA，隐式绑定，调用者是 personA
personA.show1.call(personB) // personB，显式绑定，调用者是 personB

personA.show2() // personA，首先personA是new绑定，产生了新的构造函数作用域，
				// 然后是箭头函数绑定，this指向外层作用域，即personA函数作用域
personA.show2.call(personB) // personA，同上

personA.show3()() // window，默认绑定，调用者是window
personA.show3().call(personB) // personB，显式绑定，调用者是personB
personA.show3.call(personB)() // window，默认绑定，调用者是window

personA.show4()() // personA，箭头函数绑定，this指向外层作用域，即personA函数作用域
personA.show4().call(personB) // personA，箭头函数绑定，call并没有改变外层作用域，
							  // this指向外层作用域，即personA函数作用域
personA.show4.call(personB)() // personB，解析同题目1，最后是箭头函数绑定，
							  // this指向外层作用域，即改变后的person2函数作用域
```
