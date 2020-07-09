---
title: compose函数实现函数调用扁平化
date: 2020-03-09
tags:
 - compose函数
categories:
 -  JavaScript
sidebar: auto
---

![](https://resource.limeili.co/abstract/abstract%20(26).jpg)
<!-- more -->

```js
	let fn1 = function (x) {
			return x + 10;
		};
		let fn2 = function (x) {
			return x * 10;
		};
		let fn3 = function (x) {
			return x / 10;
		};
        

    let x = fn1(5);
    x = fn2(x);
    x = fn1(x);
    x = fn3(x); 

    console.log(fn3(fn1(fn2(fn1(5))))); //=> ((5+10)*10+10)/10 => 16
```
compose函数调用的扁平化
```js
console.log(compose()(5)); //=>5
console.log(compose(fn1)(5)); //=>5+10 = 15
console.log(compose(fn1, fn2)(5)); //=>fn1(5)=15  fn2(15)=150 ...
console.log(compose(fn1, fn2, fn1, fn3)(5)); //=>16

```
```js

function compose(...funcs) {
//=>funcs:传递的函数集合
    return function proxy(...args) {
        //=>args:第一次调用函数传递的参数集合
        let len = funcs.length;
        if (len === 0) {
            //=>一个函数都不需要执行,直接返回ARGS
            return args;
        }
        if (len === 1) {
            //=>只需要执行一个函数，把函数执行，把其结果返回即可
            return funcs[0](...args);
        }
        return funcs.reduce((x, y) => {
            return typeof x === "function" ? y(x(...args)) : y(x);// x除了第一次是一个函数 剩下都是上一次处理的结果
        });
    };
}

let arr = [12, 23, 34, 45];
let total = arr.reduce((x, y) => {
    //=>x:上一次处理的结果
    //=>y:数组中某一项
    //reduce不传第二个参数：x初始值是第一项的值，然后每一次返回的结果作为下一次x的值
    //reduce传第二个参数:x初始值就是第二个参数值
    console.log(x, y);
    return x + y;
}, 0);
console.log(total);  

0 12
12 23
35 34
69 45
10 114
```