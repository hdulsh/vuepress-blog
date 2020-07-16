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
Javascript单线程任务被分为同步任务和异步任务，同步任务会在调用栈中按照顺序等待主线程依次执行，异步任务会在异步任务有了结果后，将注册的回调函数放入任务队列中等待主线程空闲的时候（调用栈被清空），被读取到栈内等待主线程的执行。  
* 同步和异步任务分别进入不同的执行"场所"，同步的进入主线程，异步的进入Event Table并注册函数。
* 当指定的事情完成时，Event Table会将这个函数移入Event Queue。
* 主线程内的任务执行完毕为空，会去Event Queue读取对应的函数，进入主线程执行。
* 上述过程会不断重复，也就是常说的Event Loop(事件循环)。
```js
setTimeout(() => {
    task()
},3000)

sleep(10000000)

- task()进入Event Table并注册,计时开始。
- 执行sleep函数，很慢，非常慢，计时仍在继续。
- 3秒到了，计时事件timeout完成，task()进入Event Queue，- 但是sleep也太慢了吧，还没执行完，只好等着。
- sleep终于执行完了，task()终于从Event Queue进入了主线程执行。

```
```js
console.log('1');

setTimeout(function() {
    console.log('2');
    process.nextTick(function() {
        console.log('3');
    })
    new Promise(function(resolve) {
        console.log('4');
        resolve();
    }).then(function() {
        console.log('5')
    })
})
process.nextTick(function() {
    console.log('6');
})
new Promise(function(resolve) {
    console.log('7');
    resolve();
}).then(function() {
    console.log('8')
})

setTimeout(function() {
    console.log('9');
    process.nextTick(function() {
        console.log('10');
    })
    new Promise(function(resolve) {
        console.log('11');
        resolve();
    }).then(function() {
        console.log('12')
    })
})
//1，7，6，8，2，4，3，5，9，11，10，12。

```



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
* 阶段1：服务器渲染
* 阶段2：客户端渲染（同源策略）
* 阶段3：客户端渲染（跨域方案）
* 阶段4：半服务器渲染 SSR  

ajax存在的意义是局部刷新提高性能  

* ajax的核心操作

* $.ajax的封装

* axios的封装

* axios的二次配置

* fetch的处理和封装
```js
//ajax的四步操作
let xhr =  new XMLHttpRequest
xhr.open('get', './js/fastclick.js', true);
xhr.onreadystatechange = function () {
	if(/^2\d{2}$/.test(xhr.status)&&xhr.readyState===4){
		console.log(xhr.responseText)
	}
}; 
xhr.send()
```
```js
//自己封装一个ajax JQ就是这种包含了超时的设置请求头的设置data格式的设置等等
ajax({
	url:'http://127.0.0.1:8888/user/list',
	method:'get'
	data:{}
	success:function(result){console.log(sesult)}
})
---------------------------------------
const qs = require('qs');//处理xxx=xxx&xxx=xxx
export default function ajax(option = {}) {
	option = Object.assign({
		url: '',
		method: 'get',
		data: null,
		success: null
	}, option);
	//get请求基于问号参数传递服务器
	//post请求基于请求主体传递给服务器
	option.data = qs.stringify(option.data); //x-www-form-urlencoded
	let isGET = /^(GET|DELETE|HEAD|OPTIONS)$/i.test(option.method);
	if (isGET && option.data) {
		let char = option.url.includes('?') ? '&' : '?';//有的url可能已经带问号了
		option.url += `${char}${option.data}`;
		option.data = null;//get请求的data已经在url里了
	}

	// 发送请求
	let xhr = new XMLHttpRequest;
	xhr.open(option.method, option.url);
	xhr.onreadystatechange = function () {
		if (/^2\d{2}$/.test(xhr.status) && xhr.readyState === 4) {
			// 成功从服务器获取结果 responseText是 JSON字符串
			typeof option.success === "function" ? option.success(JSON.parse(xhr.responseText)) : null;
		}
	};
	xhr.send(option.data);
}
```
```js
//JQ ajax会回调地狱 之后很长一段时间都在用Promise把ajax包起来
new Promise((resolve = >{
	ajax({
	url:'http://127.0.0.1:8888/user/list',
	method:'get'
	data:{}
	success:function(result){
		resolve(result)
		}
})
})).then()
//或者用Promise二次封装jqajax库 
//或者自己封装一个Promise版本ajax库(简易版的axios)
const qs = require('qs');

function ajax(option = {}) {
	option = Object.assign({
		url: '',
		method: 'get',
		data: null
	}, option);

	option.data = qs.stringify(option.data);
	let isGET = /^(GET|DELETE|HEAD|OPTIONS)$/i.test(option.method);
	if (isGET && option.data) {
		let char = option.url.includes('?') ? '&' : '?';
		option.url += `${char}${option.data}`;
		option.data = null;
	}

	return new Promise((resolve, reject) => {
		let xhr = new XMLHttpRequest;
		xhr.open(option.method, option.url);
		xhr.onreadystatechange = function () {
			if (!/^2\d{2}$/.test(xhr.status)) {
				reject(xhr);
				return;
			}
			if (xhr.readyState === 4) {
				resolve(JSON.parse(xhr.responseText));
			}
		};
		xhr.send(option.data);
	});
}

['get', 'post', 'delete', 'put', 'head', 'options'].forEach(item => {
	ajax[item] = function (url = '', data = {}) {
		return ajax({
			url,
			method: item,
			data
		});
	};
});

export default ajax;
------------------------------------------------------------------------
使用
function getUser() {
	return ajax.get('/user/list');
}

function getJob() {
	return ajax.get('/job/list');
}

function userLogin() {
	return ajax.post('/user/login', {
		account: '',
		password: ''
	});
}
(function () {
    getUser().then(result => {
		console.log("1=>", result);
		return getJob();
	}).then(result => {
		console.log("2=>", result);
		return userLogin();
	}).then(result => {
		console.log("3=>", result);
	}); 

})();

终极 用async await
	let result = await getUser();
	console.log("1=>", result);

	result = await getJob();
	console.log("2=>", result);

	result = await userLogin();
	console.log("3=>", result);
```
```js
//axios的二次封装 主要的是请求拦截器和响应拦截器
import axios from 'axios';
import qs from 'qs';

axios.defaults.baseURL = "http://127.0.0.1:8888";
axios.defaults.headers['Content-Type'] = "application/x-www-form-urlencoded";
axios.defaults.transformRequest = data => qs.stringify(data);
axios.defaults.timeout = 0;
axios.defaults.withCredentials = true;

axios.interceptors.request.use(config => {
	// 真实项目中，我们一般会在登录成功后，把从服务器获取的TOKEN信息存储到本地，以后再发送请求的时候，一般都把TOKEN带上（自定义请求头携带）
	let token = localStorage.getItem('token');
	token && (config.headers['Authorization'] = token);
	return config;
});

axios.interceptors.response.use(response => {
	return response.data;
}, reason => {
	// 从服务器没有获取数据（网络层失败）
	let response = null;
	if (reason) {
		// 起码服务器有响应，只不过状态码是4/5开头的
		response = reason.response;
		switch (response.status) {
			case 401:
				// 一般情况下都是未登录
				break;
			case 403:
				// 一般情况下是TOKEN过期
				break;
			case 404:
				// 地址不存在
				break;
		}
	} else {
		if (!window.navigator.onLine) {
			alert('和抱歉，网络连接已经断开，请联网后再试~~');
		}
	}
	return Promise.reject(response);
});

export default axios;

```

```js
终极方案 
fetch是浏览器内置的函数，
基于fetch可以向服务器发送请求，
核心原理和AJAX XMLHttpRequest 不一致
fetch（天生就是基于PROMISE管理的）
fetch('/user/login', {
	method: 'post'
}).then(response => {
	return response.json();
}).then(result => {
	console.log(result);
});
不论服务器返回的状态码是多少，都按照PROMISE成功算；只有断网，才算失败
fetch没有axios那样的拦截器所以我们要自己封装


```
## axios fetch封装
[AjaxAxiosFetch](./AjaxAxiosFetch的封装.md)


## 同步异步编程
```js
async function async1() {
    console.log('async1 start');
    await async2();
    console.log('async1 end');
}
async function async2() {
    console.log('async2');
}
console.log('script start');
setTimeout(function() {
    console.log('setTimeout');
}, 0)
async1();
new Promise(function(resolve) {
    console.log('promise1');
    resolve();
}).then(function() {
    console.log('promise2');
});
console.log('script end');
```
![](https://resource.limeili.co/image/202007031808.png)

```js
console.log(1);
setTimeout(_ => { console.log(2); }, 1000);
async function fn() {
	console.log(3);
	setTimeout(_ => {  console.log(4); }, 20);
	return Promise.reject();
}
async function run() {
	console.log(5);
	await fn();
	console.log(6);
}
run();
// 需要执行150MS左右
for (let i = 0; i < 90000000; i++) {}
setTimeout(_ => {
	console.log(7);
	new Promise(resolve => {
		console.log(8);
		resolve();
	}).then(_ => { console.log(9); });
}, 0);
console.log(10);
//1531047892
```
![](https://resource.limeili.co/image/202007031826.png)