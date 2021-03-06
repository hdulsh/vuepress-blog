---
title: Promise
date: 2020-03-09
tags:
 - Promise
categories:
 -  JavaScript
sidebar: auto
---

![](https://resource.limeili.co/abstract/abstract%20(33).jpg)
<!-- more -->

回调地狱：上一个回调函数中继续做事情，而且继续回调（在真实项目的AJAX请求中经常出现回调地狱）=>异步请求、不方便代码的维护   

		 
Promise的诞生就是为了解决异步请求中的回调地狱问题：它是一种设计模式，ES6中提供了一个JS内置类Promise，来实现这种设计模式
```js
$.ajax({
	url: '/student',
	method: 'get',
	data: {
		class: 1
	},
	success: function (result) {
		// result=>学生信息
		$.ajax({
			url: '/score',
			method: 'get',
			data: {
				stuId: result.map(item => item.id)
			},
			success: function (result) {
				// result=>学员的分数信息
				$.ajax({
					//...
				});
			}
		});
	}
});
```
```js
function ajax1() {
	return new Promise(resolve => {
		$.ajax({
			url: '/student',
			method: 'get',
			data: {
				class: 1
			},
			success: resolve
		});
	});
}

function ajax2(arr) {
	return new Promise(resolve => {
		$.ajax({
			url: '/score',
			method: 'get',
			data: {
				stuId: arr
			},
			success: resolve
		});
	});
}

function ajax3() {
	return new Promise(resolve => {
		$.ajax({
			url: '/jige',
			// ...
			success: resolve
		});
	});
}
*/

ajax1().then(result => {
	return ajax2(result.map(item => item.id));
}).then(result => {
	return ajax3();
}).then(result => {
}); 

/* async function handle() {
		let result = await ajax1();
		result = await ajax2(result.map(item => item.id));
		result = await ajax3();
		// 此处的result就是三次异步请求后获取的信息
		}
	handle(); */
```
`new Promise([executor]) `[executor]执行函数是必须传递的  
PROMISE是用来管理异步编程的，它本身不是异步的：new Promise的时候会立即把executor函数执行（只不过我们一般会在executor函数中处理一个异步操作）  
```js
// 2.3.1
let p1 = new Promise(() => {
	setTimeout(_ => {
		console.log(1);
	}, 1000);
	console.log(2);
});
console.log(3); */
```
PROMISE本身有三个状态  =>[[PromiseStatus]]
*    pending 初始状态
*    fulfilled 代表操作成功（resolved）
*    rejected 代表当前操作失败  

PROMISE本身有一个VALUE值，用来记录成功的结果（或者是失败的原因的） =>[[PromiseValue]]
```js
let p1 = new Promise((resolve, reject) => {
	setTimeout(_ => {
		// 一般会在异步操作结束后，执行resolve/reject函数，
		//执行这两个函数中的一个，都可以修改Promise的[[PromiseStatus]]/[[PromiseValue]]
		// 一旦状态被改变，在执行resolve、reject就没有用了
		resolve('ok');
		reject('no');
	}, 1000);
}); 
```
```js
new Promise的时候先执行executor函数，在这里开启了一个异步操作的任务
(此时不等：把其放入到EventQuque任务队列中），继续执行
p1.then基于THEN方法，存储起来两个函数（此时这两个函数还没有执行）；
当executor函数中的异步操作结束了，基于resolve/reject控制Promise状态，从
而决定执行then存储的函数中的某一个
let p1 = new Promise((resolve, reject) => {
	setTimeout(_ => {
		let ran = Math.random();
		console.log(ran);
		if (ran < 0.5) {
			reject('NO!');
			return;
		}
		resolve('OK!');
	}, 1000);
});
// THEN：设置成功或者失败后处理的方法
Promise.prototype.then([resolvedFn],[rejectedFn])
p1.then(result => {
	console.log(`成功：` + result);
}, reason => {
	console.log(`失败：` + reason);
});
```
```js

 // 3 再输出 100
let p1 = new Promise((resolve, reject) => {
 resolve/reject 的执行，不论是否放到一个异步操作中，
 都需要等待then先执行完，把方法存储好，
 才会在更改状态后执行then中对应的方法 
 =>此处是一个异步操作（所以很多人说PROMISE是异步的），
 而且是微任务操作
	resolve(100);
});
p1.then(result => {
	console.log(`成功：` + result);
}, reason => {
	console.log(`失败：` + reason);
});
console.log(3); 
```
```js
new Promise((resolve,reject)=>{
	resolve(100)
	//reject(0)
})
=>创建一个状态为成功/失败的PROMISE实例 
这样的写法也可以被这种写法代替 
=> Promise.resolve(100)
=> Promise.reject(0)

```
THEN方法结束都会返回一个新的Promise实例（THEN链）  

*   [[PromiseStatus]]:'pending'
*   [[PromiseValue]]:undefined  

1. p1这个new Promise出来的实例，成功或者失败，取决于executor函数执行的时候，执行的是resolve还是reject决定的，再或者executor函数执行发生异常错误，也是会把实例状态改为失败的  
2. p2/p3这种每一次执行then返回的新实例的状态，由then中存储的方法执行的结果来决定最后的状态（上一个THEN中某个方法执行的结果，决定下一个then中哪一个方法会被执行）  
3. 不论是成功的方法执行，还是失败的方法执行（THEN中的两个方法），凡是执行抛出了异常，则都会把实例的状态改为失败  

4. 方法中如果返回一个新的PROMISE实例，返回这个实例的结果是成功还是失败，也决定了当前实例是成功还是失败  

5. 剩下的情况基本上都是让实例变为成功的状态 （方法返回的结果是当前实例的value值：上一个then中方法返回的结果会传递到下一个then的方法中）
```js
let p1 = new Promise((resolve, reject) => {
	resolve(100);
});
let p2 = p1.then(result => {
	console.log('成功：' + result);
	return result + 100;
}, reason => {
	console.log('失败：' + reason);
	return reason - 100;
});
let p3 = p2.then(result => {
	console.log('成功：' + result);
}, reason => {
	console.log('失败：' + reason);
}); */ 成功100成功200


new Promise(resolve =>{
	resolve(a) // 因为a没定义 报错
}).then(result=>{
	console.log('成功:'+result);
	return result * 10
},reason=>{
	console.log('失败:'+reason)
}).then(result = >{
	console.log('成功:'+result); //成功undefined 上一个reason里没有返回return结果所以值是undefined
},reason=>{
	console.log('失败:'+reason)
})



Promise.resolve(10).then(result => {
	console.log(`成功：${result}`);
	return Promise.reject(result * 10);
}, reason => {
	console.log(`失败：${reason}`);
}).then(result => {
	console.log(`成功：${result}`);
}, reason => {
	console.log(`失败：${reason}`);
});
// 成功10 失败100 

TEHN中也可以只写一个或者不写函数
	.then(fn)
	.then(null,fn)
	遇到一个THEN，要执行成功或者失败的方法，如果此方法并没有在当前THEN中被定义，则顺延到下一个对应的函数
Promise.reject(10).then(result => {
	console.log(`成功：${result}`);
	return result * 10;
}).then(null, reason => {
	console.log(`失败：${reason}`);
}); ·
//失败100

 Promise.prototype.catch(fn)
 ===> .then(null,fn)


Promise.resolve(10).then(result => {
	console(a);//=>报错了
}).catch(reason => {
	console.log(`失败：${reason}`);
});

```
`Promise.all(arr)：`返回的结果是一个PROMISE实例（ALL实例），要求ARR数组中的每一项都是一个新的PROMIE实例，PROMISE.ALL是等待所有数组中的实例状态都为成功才会让“ALL实例”状态为成功，VALUE是一个集合，存储着ARR中每一个实例返回的结果；凡是ARR中有一个实例状态为失败，“ALL实例”的状态也是失败  
`Promise.race(arr)：`和ALL不同的地方，RACE是赛跑，也就是ARR中不管哪一个先处理完，处理完的结果作为“RACE实例”的结果
```js

let p1 = Promise.resolve(1);
let p2 = new Promise(resolve => {
	setTimeout(_ => {
		resolve(2);
	}, 1000);
});
let p3 = Promise.reject(3);

Promise.all([p2, p1]).then(result => {
	// 返回的结果是按照ARR中编写实例的顺序组合在一起的
	// [2,1]
	console.log(`成功：${result}`);
}).catch(reason => {
	console.log(`失败：${reason}`);
}); */
```

ES7中提供了PROMISE操作的语法糖：async / await
```js
* ASYNC 是让一个普通函数返回的结果变为STATUS=RESOLVED并且VALUE=RETURN结果的PROMISE实例 
		 
* ASYNC 最主要的作用是配合AWAIT使用的，因为一旦在函数中使用AWAIT，那么当前的函数必须用ASYNC修饰
		
	async function fn() {
		return 10;
	}
	console.log(fn());



	let p1 = Promise.resolve(100);
	let p2 = new Promise(resolve => {
		setTimeout(_ => {
			resolve(200);
		}, 1000);
	});
	let p3 = Promise.reject(3);


// 1     2    100
async function fn() {
	console.log(1);
AWAIT会等待当前PROMISE的返回结果，只有返回的状态是RESOLVED情况，
才会把返回结果赋值给RESULT
AWAIT不是同步编程，是异步编程（微任务）:
当代码执行到此行（先把此行），构建一个异步的微任务
（等待PROMISE返回结果，并且AWAIT下面的代码也都被列到任务队列中），
	let result = await p1;
	console.log(result);

}
fn();
console.log(2);

// 1 2 100 200
   async function fn() {
	console.log(1);
	let result = await p1;
	console.log(result);

	let AA = await p2;
	console.log(AA);
}
fn();
console.log(2); 


async function fn() {
	// 如果PROMISE是失败状态，则AWAIT不会接收其返回结果，
	//AWAIT下面的代码也不会在继续执行
	//（AWAIT只能处理PROMISE为成功状态的时候）
	let reason = await p3;
	console.log(reason);
}
fn(); */

```