---
title: parseInt
date: 2020-03-09
tags:
 - 
categories:
 - 
---

```js
let arr = [10.18,0,10,25,23]
arr= arr.map(parseInt)
console.log(arr) 
```
```js
arr.map((item,index) => {})

parseInt(10.18, 0) //10
parseInt(0,1) //NaN
parseInt(10,2) // 看做二进制的10 再把它转为十进制
//0*2^0 + 1*2^1  = 2
parseInt(25,3)//5超过3进制了，所以只解析出来2
//3进制的2转成十进制
//2*3^0= 2
parseInt(23,4)
//3*4^0 + 2*4^1  = 11
```
parseInt([value])内核机制是先把value变成字符串，然后从字符串左侧第一个字符查找，把找到的有效数字字符转换为数字，知道遇到一个非有效数字字符为止  
`parseInt([value],[n])`  
**把value看做n进制的数据，最后转换为十进制**  
n不写，默认是10，特殊情况字符串以0X开头默认值是16进制  
n的范围2~36之间，除了0和10是一样的，剩下结果都是NaN 
