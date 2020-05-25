---
title: currying函数
date: 2020-03-09
tags:
 - currying函数
categories:
 -  JavaScript
sidebar: auto
---

![](https://resource.limeili.co/abstract/abstract%20(27).jpg)
<!-- more -->
```js
add(1);       //1
add(1)(2);    //3
add(1)(2)(3); //6
add(1)(2,3);  //6
add(1,2)(3);  //6
add(1,2,3);   //6
```
# 方案一
```js

   function add(...outerArgs) {
	add = function (...innerArgs) {
		outerArgs.push(...innerArgs);
		return add;
	};
	add.toString = function () {
		return outerArgs.reduce((x, y) => x + y);
	};
	return add;
}
let res = add(1, 2)(3)(4)(5)(6, 7);
alert(res);  //=>alert会把输出的值转换为字符串（toString()） */
/*
 * 第一次执行ADD  outerArgs=[1,2]  重写了ADD
 * 第二次执行ADD  innerArgs=[3]   outerArgs=[1,2,3]
 * 第三次执行ADD  innerArgs=[4]   outerArgs=[1,2,3,4]
 * ......
 * outerArgs=[1,2,3,4,5,6,7]
 */
// console.log(res.toString());
```

# 方案二
```js
function currying(anonymous, length) {
	return function add(...args) {
		if (args.length >= length) {
			return anonymous(...args);
		}
		return currying(anonymous.bind(null, ...args), length - args.length);
	}
}
let add = currying(function anonymous(...args) {
	return args.reduce((x, y) => x + y);
}, 4);
/*
 * AO(currying) 
 *   anonymous=求和函数
 *   length=4
 * ADD第一次执行  args=[1,2]
 *   currying第二次执行
 * 		anonymous=求和函数 预先传递的参数[1,2]
 *      length=2
 * 	 ADD第二次执行 args=[3]
 *      currying第三次执行 
 *        anonymous=求和函数 预先传递的参数[3]
 *        length=1
 *      ADD函数第三次执行 args=[4]
 *        把上一次的求和函数执行(4)
 */
console.log(add(1, 2)(3)(4));
```