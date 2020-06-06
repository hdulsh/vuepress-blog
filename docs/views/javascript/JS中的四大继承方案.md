---
title: JS中的四大继承方案
date: 2020-03-09
tags:
 - 继承
categories:
 -  JavaScript
sidebar: auto
---

![](https://resource.limeili.co/abstract/abstract%20(29).jpg)
<!-- more -->


封装 继承 多态 
`类的多态：重载和重写`  

 * JAVA中重载：函数名相同，但是传参类型、数量不同或者返回值不一样，这相当与把一个函数重载了 （JS中没有类似于后台语言中的重载机制：JS中的重载指的是同一个方法，根据传参不同，实现不同的业务逻辑）
 * 重写：子类重写父类上的方法

`继承`  
 * 类继承父类中的属性和方法（JS中的继承机制和其它后台语言是不一样的，有自己的独特处理方式）
## 原型继承
子类的原型指向父类的一个实例
```js
function A() {
        this.x = 100;
    }
    A.prototype.getX = function getX() {
        console.log(this.x);
    };

    function B() {
        this.y = 200;
    }
    B.prototype.sum=function(){}
    B.prototype = new A;
    B.prototype.getY = function getY() {
        console.log(this.y);
    };
    let b = new B;
```
![](https://resource.limeili.co/image/202005271131.png)
1. 多个实例对引用类型的操作会被篡改
2. 子类型的原型上的 constructor 属性被重写了
3. 给子类型原型添加属性和方法必须在替换原型之后
4. 创建子类型实例时无法向父类型的构造函数传

## CALL继承
把父类当做普通函数执行，让其执行的时候，方法中的this变为子类的实例即可  
`特点`  
* 只能继承父类中的私有属性（继承的私有属性赋值给子类实例的私有属性），而且是类似拷贝过来一份，而不是链式查找
* 因为只是把父类当做普通的方法执行，所以父类原型上的公有属性方法无法被继承过来
```js
function A() {
    this.x = 100;
}
A.prototype.getX = function getX() {
    console.log(this.x);
};

function B() {
    //CALL继承
    A.call(this);  //=>this.x = 100;  b.x=100;
    this.y = 200;
}
B.prototype.getY = function getY() {
    console.log(this.y);
};
let b = new B;
console.log(b);
```

## 寄生组合继承
CALL继承+变异版的原型继承共同完成的  
* CALL继承实现：私有到私有
* 原型继承实现：公有到公有
```js
    function A() {
        this.x = 100;
    }
    A.prototype.getX = function getX() {
        console.log(this.x);
    };

    function B() {
        A.call(this);
        this.y = 200;
    }
    //=>Object.create(OBJ) 创建一个空对象，让其__proto__指向OBJ（把OBJ作为空对象的原型）
    B.prototype = Object.create(A.prototype);
    B.prototype.constructor = B;
    B.prototype.getY = function getY() {
        console.log(this.y);
    };
    let b = new B;
    console.log(b);
```
![](https://resource.limeili.co/image/202005271144.png)

## ES6 class
```js
    class A {
        constructor() {
            this.x = 1000;
        }
        //=>这样和构造函数中的this.xxx=xxx没啥区别，设置的是私有属性（ES7）
        num = 100;
        //=>设置到A.prototype上的方法
        getX() {
            console.log(this.x);
        }
        //=>把A当做普通对象设置的属性和方法
        static n = 200;
        static getN() {}
    }
    console.log(new A); 
```
```js
class A {
        constructor() {
            this.x = 100;
        }
        getX() {
            console.log(this.x);
        }
    }
    //=>extends继承和寄生组合继承基本类似
    class B extends A {
        constructor() {
            super(100); //=>一但使用extends实现继承，只要自己写了constructor，就必须写super  <=> A.call(this,100)
            this.y = 200;
        }
        getY() {
            console.log(this.y);
        }
    }

    let b = new B; 
```
## 真实项目中使用继承的地方
```js
    * 真实项目中使用继承的地方
    *   1.REACT创建类组件
    *   2.自己写插件或者类库的时候
    *   ......
    *
class Vote extends React.Component{

} 

class Utils{
    //=>项目中公共的属性和方法
}

class Dialog extends Utils{

}
```