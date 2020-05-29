---
title: JS中的事件队列和事件循环机制
date: 2020-03-09
tags:
 - 队列
categories:
 -  JavaScript
sidebar: auto
---

![](https://resource.limeili.co/abstract/abstract%20(32).jpg)
<!-- more -->
## JS中的事件队列和事件循环机制
JS本身是单线程的（浏览器只分配一个线程供JS代码自上而下运行）  
在JS中大部分操作都是同步编程：当前任务不完成，下一个任务是无法继续执行的，换句话说，任务是逐一执行的  
但是对于某些特殊的需求，也是需要按照异步编程的思维去处理的  
`浏览器端`  
+ 定时器是异步编程
+ JS中的事件绑定是异步编程
+ Ajax/Fetch请求的发送（HTTP事务）
+ Promise设计模式管控异步编程的（包括：async/await...）  
`Node端`  
+ progress.nextTick
+ setImmediate
+ FS进行I/O操作可以是异步操作  
**JS中异步操作的运行机制：事件队列 Event Queue 和 事件循环 Event Loop**
![](https://resource.limeili.co/image/202005281847.png)
```js
setTimeout(() => {
    console.log(1);
}, 20);
console.log(2);
setTimeout(() => {
    console.log(3);
}, 10);
console.log(4);
console.time('AA');
for (let i = 0; i < 90000000; i++) {
    // do soming
}
console.timeEnd('AA'); //=>AA: 280ms 左右
console.log(5);
setTimeout(() => {
    console.log(6);
}, 8);
console.log(7);
setTimeout(() => {
    console.log(8);
}, 15);
console.log(9);// 245793168
```
![](https://resource.limeili.co/image/202005281903.png)

 ```js
console.log(1);
setTimeout(_ => {
	console.log(2);
}, 50);
console.log(3);
setTimeout(_ => {
	console.log(4);
	// 遇到死循环  =>所有代码执行最后都是在主栈中执行，遇到死循环，主栈永远结束不了，后面啥都干不了了
	while (1 === 1) {}
}, 0);
console.log(5); 
//// 1 3  5  4 
 ```
## JS中ajax的异步性
```js
let $body = $('body');
$.ajax({
	// 随便写了个地址
	url: './js/fastclick.js',
	method: 'get',
	success(result) {
		// 获取数据后动态创建了一个盒子
		$body.append(`<div id='box' class='box'></div>`);
	}
});
console.log($('#box')); //=>获取不到元素
$('#box').click(function () {
	$(this).css('background', 'lightcoral');
});//没效果

let $body = $('body');
$.ajax({
	// 随便写了个地址
	url: './js/fastclick.js',
	method: 'get',
	success(result) {
		// 获取数据后动态创建了一个盒子
		$body.append(`<div id='box' class='box'></div>`);
	}
});
// 基于事件委托可以给动态绑定的元数据进行相关的处理
$body.click(function (ev) {
	let target = ev.target,
		$target = $(target);
	if (target.id === 'box') {
		$target.css('background', 'lightcoral');
	}
}); 
```
核心都是ajax操作：JQ中的$.ajax是帮我们封装好的ajax库；axios也是基于Promise封装的ajax库  
fetch是浏览器内置的发送请求的类（天生就是Promise管控的）  
```js
 
* AJAX的状态：xhr.readyState
*   UNSENT 0  创建完XHR默认就是0
*   OPENED 1  已经完成OPEN操作
*   HEADERS_RECEIVED 2 服务器已经把响应头信息返回了
*   LOADING 3  响应主体正在返回中
*   DONE 4 响应主体已经返回
* 
* XHR.OPEN第三个参数控制的同步异步指的是：从
当前SEND发送请求，算任务开始，一直到AJAX状态为4才算任务结束
（同步是：在此期间所有的任务都不去处理，而异步是：在此期间该干啥干啥）  
=>异步在SEND后，会把这个请求的任务放在EventQueue中（宏任务）
true是异步 false同步

let xhr = new XMLHttpRequest;
xhr.open('get', './js/fastclick.js', true);
// console.log(xhr.readyState); //=>1
xhr.onreadystatechange = function () {
//=>监听到状态改变后才会触发的事件 改变一次触发一次   
	console.log(xhr.readyState); //=>2,3,4
};
xhr.send(); 


let xhr = new XMLHttpRequest;
xhr.open('get', './js/fastclick.js', true);
xhr.send();
xhr.onreadystatechange = function () {
	console.log(xhr.readyState); //=>2.3.4
}; 


let xhr = new XMLHttpRequest;
xhr.open('get', './js/fastclick.js', false);
xhr.send();
xhr.onreadystatechange = function () {
	console.log(xhr.readyState);  //不输出 执行send之后已经是4了
}; 

let xhr = new XMLHttpRequest;
xhr.open('get', './js/fastclick.js', false);
xhr.onreadystatechange = function () {
	console.log(xhr.readyState); //=>4
};
xhr.send();  //任务为4的时候主栈才结束

```

