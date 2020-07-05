---
title: new的实现原理
date: 2020-03-09
tags:
 - new
 - 面向对象
categories:
 -  JavaScript
sidebar: auto
---

![](https://resource.limeili.co/abstract/abstract%20(27).jpg)
<!-- more -->

# 面相对象编程(OOP)
`OOP（Object Oriented Programming）`：面向对象程序设计  

`POP（Procedure /prəˈsiːdʒər/ Oriented）`：面向过程程序设计  
```js
对象：万物皆对象
类：对象的细分
实例：类中具体的事物
=============
JS也是面向对象编程：类、实例
    1 ->Number
    'A' ->String
    true ->Boolean
    null ->Null                ->Object
    undefined ->Undefined
    [] ->Array
    /^$/ ->RegExp
    function(){}  ->Function
    {} ->Object

每一个元素标签（元素对象）都有一个自己所属的大类
    div -> HTMLDivElement -> HTMLElement -> Element -> Node -> EventTarget -> Object  
    每一个实例可以调用所属类（整条链）中的属性和方法
``` 
```js
 
*创建一个自定义类 
* =>创建一个函数（Function类的实例），直接执行就是普通函数，但是“new 执行”它则被称为一个自定义的类
*NEW 函数执行
*     形成一个全新的执行上下文EC
*     形成一个AO变量对象
*        ARGUMENTS
*        形参赋值
*     初始化作用域链
*     [新]默认创建一个对象，而这个对象就是当前类的实例
*     [新]声明其THIS指向，让其指向这个新创建的实例
*     代码执行
*     [新]不论其是否写RETURN，都会把新创建的实例返回（特殊点）

function func() {
    // let obj={}; //=>这个对象就是实例对象
    // this -> obj
    let x = 100;
    this.num = x +
        100; //=>相当于给创建的实例对象新增一个num的属性 obj.num=200 （因为具备普通函数执行的一面，所以只有this.xxx=xxx才和创建的实例有关系，此案例中的x只是AO中的私有变量）
    // return obj;  用户自己返回内容，如果返回的是一个引用类型值，则会把默认返回的实例给覆盖掉（此时返回的值就不在是类的实例了）
}
let f = new func();
console.log(f); //=>f是func这个类的实例 {num:200}

// let f2 = new func();
// console.log(f === f2); //=>false 每一次new出来的都是一个新的实例对象（一个新的堆内存）

// console.log(f instanceof func); //=>TRUE instanceof用来检测某一个实例是否属于这个类

// func(); //=>this:window  AO(FUNC):{x=100} ... 普通函数执行
```

#  内置NEW的实现原理 
```js
function _new(Func, ...args) {
    //默认创建一个实例对象（而且是属于当前这个类的一个实例）
    // let obj = {};
    // obj.__proto__ = Func.prototype; //=>IE大部门浏览器中不允许我们直接操作__proto__
    let obj = Object.create(Func.prototype);

    //也会把类当做普通函数执行
    //执行的时候要保证函数中的this指向创建的实例
    let result = Func.call(obj, ...args);

    //若客户自己返回引用值，则以自己返回的为主，否则返回创建的实例
    if ((result !== null && typeof result === "object") || (typeof result === "function")) {
        return result;
    }
    return obj;
}
```