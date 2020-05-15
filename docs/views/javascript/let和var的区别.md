---
title: let/var/const区别
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

## 全局对象GO
全局变量对象VO(G)中声明的变量（用var声明的），也会给全局对象GO中增加一个对应的属性；但是用let声明的变量不存在这个特点
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

	    console.log(typeof a); //=>undefined  JS的暂时性死区（暂时没解决的BUG）



		console.log(typeof a); //=>Uncaught ReferenceError: Cannot access 'a' before initialization
		let a;
```


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