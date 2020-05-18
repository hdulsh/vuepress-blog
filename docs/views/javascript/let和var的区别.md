---
title: 变量提升和let/var/const区别
date: 2020-05-15
tags:
 - 变量提升
categories:
 -  JavaScript
sidebar: auto
---
![](https://resource.limeili.top/abstract/abstract%20(23).jpg)
<!-- more -->
## 变量提升

```js
	
		 * ECStack
		 *   EC(G)
		 *     VO(G)
		 *        a = 12
		 *        fn = AAAFFF111  fn[[scope]]=VO(G)
		 *   在当前执行上下文代码执行之前，首先会把所有带var或者function关键字的声明或者定义（带var的只是提前声明，带function会提前的声明+定义）
		 *   console.log(a); //=>undefined
		 *   fn();
		 *   a = 12;
		 *   console.log(a); //=>12  
		 *
       
       
    console.log(a);
	fn();
	var a = 12;
	function fn() {
		console.log('ok');
	}
```
```js

		 * ECStack
		 *   EC(G)
		 *     VO(G)
		 *   代码执行
		 *   let a = 12;
		 */
		console.log(a); //=>Uncaught ReferenceError: Cannot access 'a' before initialization
		let a = 12;
		//=>现在项目中创建函数，一般都是基于函数表达式来实现，这样防止其提前变量提升
		let fn = function () {

		};
		fn(); 
```
```js
fn();
function fn(){ console.log(1); }
fn();
function fn(){ console.log(2); }
fn();
var fn = function(){ console.log(3); }
fn();
function fn(){ console.log(4); }
fn();
function fn(){ console.log(5); }
fn();


		 * EC(G)
		 *   VO(G)
		 *     fn = AAAFFF111
		 *        = AAAFFF222
		 *        = AAAFFF444
		 *        = AAAFFF555 （变量提升阶段完成，fn=AAAFFF555）
		 * 代码执行
		 *
		fn(); //=>5
		function fn(){ console.log(1); }
		fn(); //=>5
		function fn(){ console.log(2); }
		fn(); //=>5
		//=> fn = AAAFFF333  之前只提升了fn但还没赋值
		var fn = function(){ console.log(3); }
		fn(); //=>3
		function fn(){ console.log(4); }
		fn(); //=>3
		function fn(){ console.log(5); }
		fn(); //=>3 */
```
### 条件判断下的变量提升
在当前作用域下不管条件是否成立都要进行变量提升，  
带var的还是只声明  
带Function的在老版本浏览器的渲染机制下，声明和定义都处理，但是为了迎合es6中的块作用域，新版本浏览器对于函数（在条件判断中的函数）不管条件是否成立，都只是先声明，没有定义 类似于var
```js
console.log(fn) =>undefined
if(1===1){
    console.log(fn) =>函数本身 当条件成立，进入到判断体中（es6中他是一个会计作用域）第一件事并不是代码执行，而是类似于变量提升，先把fn声明和定义了，也就是判断体中代码执行之前，fn就已经赋值了
    function fn(){console.log(0)}
}
console.log(fn) =>函数本身
```
### 变量提升重名的处理
1. 带var和function关键字声明相同的名字，这种也算是重名了（其实是一个fn，只是存储值的类型不一样）
2. 如果名字重复了，不会重新的声明，但是会重新定义（重新赋值）[不管是变量提升还是代码执行阶段皆是如此]
```js
fn()//4
function fn(){console.log(1)}
fn()//4
function fn(){console.log(2)}
fn()//4
var fn = 100
fn()// Uncaught TypeError: fn is not a function
    
function fn(){console.log(3)}
fn()
function fn(){console.log(4)}
fn()
```
## 全局对象GO
全局变量对象VO(G)中声明的变量（用var声明的），也会给全局对象GO中增加一个对应的属性；但是用let声明的变量不存在这个特点 ,切断了全局变量和window属性的映射机制
```js
var x = 12;
console.log(window.x); //=>12

let x = 12;
console.log(window.x); //=>undefined

function fn() {
		// 	/*
		// 	 * EC(FN)
		// 	 *   AO(FN) 
		// 	 *     x = 100
		// 	 */
	var x = 100;
	console.log(fn.x); //=>undefined  仅限于全局有创建全局变量也相当于给全局对象设置属性有这个特点，私有的执行上下文中就是私有变量
	}
fn();

function fn() {
		//此时的x不是AO（FN）中的私有变量，则向全局找，此处相当于给全局VO（G）变量对象中设置了一个x的全局变量，也相当于给全局对象GO设置了一个x的属性
		x = 100;
	}
	fn();
	console.log(window.x); //100
```

## 不允许重复声明
```js

		 * 编译阶段（编译器）
		 *   词法解析 => AST抽象语法树（给浏览器引擎去运行的）
		 * 引擎执行阶段
		 *   ECStack => EC(G) => VO(G) ... 
		 *  
		 * 带var的是可以重复声明的（词法解析可以审核过），执行阶段遇到已经声明过，不会在重新声明；但是let是不可以，词法解析阶段都过不去，也就不存在引擎去执行代码的阶段了；
		 */
	console.log('OK');
	let x = 12;
	console.log(x);
	let x = 13; //Uncaught SyntaxError: Identifier 'x' has already been declared 只输出了这一行 说明还没有执行代码在编译阶段就报错了声明了两个 x
	console.log(x);
```
在相同的作用域中，基于let不能声明相同名字的变量，不管用什么方式在当前作用域下声明了变量，再次使用let创建都会报错  
虽然没有变量提升机制，但是再当前作用域代码自上而下执行之前，浏览器会做一个重复性检测（语法检测），自上而下查找当前作用域下的所有变量，一旦发现有重复的，直接抛出异常，代码也不再执行了
```js
b=12
console.log(b) // 12


a=12  //a is not define
console.log(a)
let a = 13
console.log(a) 
```
```js
let a = 10
    b = 10
let fn = function (){
    //console.log(a,b) // a is not define
	// 为什么到这一行直接报错 因为浏览器重复性检测发现
	//a是es6的语法只能在声明之后用
    let a = b = 20
    //let a =20 
    //b=20  把全局中的b =20
    console.log(a,b)  // 20 20 
} 
fn()
console.log(a,b) // 10 20
```


## 块级作用域
### 循环闭包处理
```js
10MS后连续输出五个5
	for (var i = 0; i < 5; i++) {
		//定时器是异步操作:不用等定时器到时间，继续下一轮循环
		setTimeout(_ => {
			console.log(i);
		}, 10);
    }


10MS后连续输出0~4
		for (var i = 0; i < 5; i++) {
		 	//=>每一轮循环都执行自执行函数，形成全新的执行上下文EC
		 	// 并且把每一轮循环的全局i的值，当做实参赋值给私有下文中的私有变量i（形参变量）
		 	// 10MS定时器触发执行，用到的i都是私有EC中的保留下来的i
		 	//=>充分利用闭包的机制（保存/保护）来完成的（这样处理不太好，循环多少次，就形成了多少个不销毁的EC）
		 	(function (i) {
		 		
		 		 * EC(自执行)
		 		 *   AO(自执行) 
		 		 *    i = 0~4
				 *   创建一个匿名函数_=>{...} BBBFFF000
		 		 *   BBBFFF000[[scope]]:AO(自执行)
		 		 * 
		 		 *   window.setTimeout(BBBFFF000，10); 相当于全局下的setTimeout占用了BBBFFF000这个堆所以不销毁
		 		 */
		 		setTimeout(_ => {
					
		 			 * EC(BBBFFF000) 
		 			 *   AO(BF0)  <AO(BF0),AO(自执行)>
		 			
					console.log(i); i不是私有的所以去自执行里面找
		 		}, 10);
		 	})(i);
         }
         


=>let存在块级作用域（var没有）
		for (let i = 0; i < 5; i++) {
			setTimeout(_ => {
				console.log(i);
			}, 10);
		} 
		{
			//=>父块作用域
			let i = 0;

			// 第一轮循环
			{
				//=>子块作用域
				let i = 0;
				setTimeout(_ => {console.log(i);}, 10);
			}
			i++; //=>i=1
			// 第二轮循环
			{
				//=>子块作用域
				let i = 1;
				setTimeout(_ => {console.log(i);}, 10);
			}
			// ....
		}

		for (let i = 0; i < 5; i++) {
			setTimeout(_ => {
				console.log(i);
			}, 10);
		}
		console.log(i);//=>Uncaught ReferenceError: i is not defined 用来累计的i也是父块作用域中的，也不是全局的，全局还是不能用
```

### 块级作用域处理
除了对象的{}剩下的基本都是块作用域
```js
	if (1 === 1) {
			let x = 100;
			console.log(x); //100
		}
        console.log(x); //=>Uncaught ReferenceError: x is not defined
    
    同理的还有switch     try catch


       let a = 100;
		switch (a) {
			case 100:
				let x = 200;
			case 200:
			    //let x = 300; //=>Uncaught SyntaxError: Identifier 'x' has already been declared
				break;
		}
		console.log(x); //=>Uncaught ReferenceError: x is not defined


   try {
			let x = 100;
			console.log(x); //=>100
			console.log(a);
		} catch (e) {
			let y = 200;
			console.log(y); //=>200
		}
		// console.log(x);//=>Uncaught ReferenceError: x is not defined
		// console.log(y); //=>Uncaught ReferenceError: y is not defined */

```

## 暂时性死区
```js

	    console.log(typeof a); //=>undefined 在原有浏览器的渲染机下，基于typeof等逻辑运算符检测一个未被声明过的变量不会报错 返回undefined ， JS的暂时性死区（暂时没解决的BUG）



		console.log(typeof a); //=>Uncaught ReferenceError: Cannot access 'a' before initialization
		let a;
	    //es6解决了浏览器暂时性死区的问题
```
如果当前变量是基于ES6语法处理，在没有声明这个变量的时候 用typeof检测会直接报错 不会是undefined 解决了浏览器暂时性死区的问题(其实就是浏览器的bug)


## let和const区别
```js

=>let和const：let创建的变量是可以`更改指针指向的`（也就是可以重新赋值的）
  但是const声明的变量是`不允许改变指针指向的`
  (说let创建的是变量 const创建的是常量是不够准确的 应该是说能否更改指针的指向)
	    let x = 100;
		x = 200;
		console.log(x); //=>200

		const y = 100;
		y = 200; //=>Uncaught TypeError: Assignment to constant variable.
		console.log(y);
```