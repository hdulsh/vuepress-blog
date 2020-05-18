---
title: 理解 Javascript 执行上下文和执行栈
date: 2020-03-09
tags:
 - 执行上下文
 - 闭包
 - 执行栈
 - 作用域
categories:
 -  JavaScript
sidebar: auto
---
![](https://resource.limeili.co/abstract/abstract%20(2).jpg)
<!-- more -->
## 什么是执行上下文

简而言之，执行上下文就是当前 JavaScript 代码被解析和执行时所在环境的抽象概念， JavaScript 中运行任何的代码都是在执行上下文中运行。

### 执行上下文的类型
1. 全局执行上下文  

这是默认的、最基础的执行上下文。不在任何函数中的代码都位于全局执行上下文中。它做了两件事:  
* 创建一个全局对象，在浏览器中这个全局对象就是 window 对象。
* 将 this 指针指向这个全局对象。一个程序中只能存在一个全局执行上下文。

2. 函数执行上下文  
每次调用函数时，都会为该函数创建一个新的执行上下文。每个函数都拥有自己的执行上下文，但是只有在函数被`调用`的时候才会被创建。一个程序中可以存在任意数量的函数执行上下文。每当一个新的执行上下文被创建，它都会按照特定的顺序执行一系列步骤，具体过程将在本文后面讨论。

3. Eval 函数执行上下文  
运行在 eval 函数中的代码也获得了自己的执行上下文


## 执行栈
执行栈，在其他编程语言中也被叫做调用栈，具有 `LIFO（后进先出）`结构，**用于存储在代码执行期间创建的所有执行上下文**。  
当 JavaScript 引擎首次读取你的脚本时，它会创建一个全局执行上下文并将其推入当前的执行栈。每当发生一个函数调用，引擎都会为该函数创建一个新的执行上下文并将其推到当前执行栈的顶端。
引擎会运行执行上下文在执行栈顶端的函数，当此函数运行完成后，其对应的执行上下文将会从执行栈中弹出，上下文控制权将移到当前执行栈的下一个执行上下文。
```js
let a = 'Hello World!';

function first() {  
  console.log('Inside first function');  
  second();  
  console.log('Again inside first function');  
}

function second() {  
  console.log('Inside second function');  
}

first();  
console.log('Inside Global Execution Context');

```
![](https://resource.limeili.co/image/202003171357.png)

```js
function fun3() {
    console.log('fun3')
}

function fun2() {
    fun3();
}

function fun1() {
    fun2();
}

fun1();

// 伪代码

// fun1()
ECStack.push(<fun1> functionContext);

// fun1中竟然调用了fun2，还要创建fun2的执行上下文
ECStack.push(<fun2> functionContext);

// 擦，fun2还调用了fun3！
ECStack.push(<fun3> functionContext);

// fun3执行完毕
ECStack.pop();

// fun2执行完毕
ECStack.pop();

// fun1执行完毕
ECStack.pop();

// javascript接着执行下面的代码，但是ECStack底层永远有个globalContext
```

`下面两段代码执行的结果一样，但是两段代码究竟有哪些不同呢？`
```js
var scope = "global scope";
function checkscope(){
    var scope = "local scope";
    function f(){
        return scope;
    }
    return f();
}
checkscope();

var scope = "global scope";
function checkscope(){
    var scope = "local scope";
    function f(){
        return scope;
    }
    return f;
}
checkscope()();
```
**答案是**  `执行上下文栈的变化不一样`
```js
ECStack.push(<checkscope> functionContext);
ECStack.push(<f> functionContext);
ECStack.pop();
ECStack.pop();


ECStack.push(<checkscope> functionContext);
ECStack.pop();
ECStack.push(<f> functionContext);
ECStack.pop();
```

## 执行上下文是如何被创建的
### 创建阶段
在任意的 JavaScript 代码被执行前，执行上下文处于创建阶段。在创建阶段中总共发生了三件事情：
1. 确定 this 的值，也被称为 This Binding。
2. LexicalEnvironment（词法环境） 组件被创建。
3. VariableEnvironment（变量环境） 组件被创建。
```js
ExecutionContext = {  
  ThisBinding = <this value>,  
  LexicalEnvironment = { ... },  
  VariableEnvironment = { ... },  
}
```
**This Binding:**
在全局执行上下文中，this 的值指向全局对象，在浏览器中，this 的值指向 window 对象。
在函数执行上下文中，this 的值取决于函数的调用方式。如果它被一个对象引用调用，那么 this 的值被设置为该对象，否则 this 的值被设置为全局对象或 undefined（严格模式下）

**词法环境**  
词法环境有两个组成部分

1. `环境记录:`存储变量和函数声明的实际位置

2. `对外部环境的引用：`可以访问其外部词法环境

词法环境有两种类型
1. `全局环境：`是一个没有外部环境的词法环境，其外部环境引用为 null。拥有一个全局对象（window 对象）及其关联的方法和属性（例如数组方法）以及任何用户自定义的全局变量，this 的值指向这个全局对象。

2. `函数环境：`用户在函数中定义的变量被存储在环境记录中，包含了arguments 对象。对外部环境的引用可以是全局环境，也可以是包含内部函数的外部函数环境。
```js
GlobalExectionContext = {  // 全局执行上下文
  LexicalEnvironment: {    	  // 词法环境
    EnvironmentRecord: {   		// 环境记录
      Type: "Object",      		   // 全局环境
      // 标识符绑定在这里 
      outer: <null>  	   		   // 对外部环境的引用
  }  
}

FunctionExectionContext = { // 函数执行上下文
  LexicalEnvironment: {  	  // 词法环境
    EnvironmentRecord: {  		// 环境记录
      Type: "Declarative",  	   // 函数环境
      // 标识符绑定在这里 			  // 对外部环境的引用
      outer: <Global or outer function environment reference>  
  }  
}
```
**变量环境**
变量环境也是一个词法环境，因此它具有上面定义的词法环境的所有属性  
在 ES6 中，词法 环境和 变量 环境的区别在于前者用于存储`函数声明和变量（ let 和 const ）绑定`，而后者仅用于存储`变量（ var ）绑定`
```js
let a = 20;  
const b = 30;  
var c;

function multiply(e, f) {  
 var g = 20;  
 return e * f * g;  
}

c = multiply(20, 30);


GlobalExectionContext = {

  ThisBinding: <Global Object>,

  LexicalEnvironment: {  
    EnvironmentRecord: {  
      Type: "Object",  
      // 标识符绑定在这里  
      a: < uninitialized >,  
      b: < uninitialized >,  
      multiply: < func >  
    }  
    outer: <null>  
  },

  VariableEnvironment: {  
    EnvironmentRecord: {  
      Type: "Object",  
      // 标识符绑定在这里  
      c: undefined,  
    }  
    outer: <null>  
  }  
}

FunctionExectionContext = {  
   
  ThisBinding: <Global Object>,

  LexicalEnvironment: {  
    EnvironmentRecord: {  
      Type: "Declarative",  
      // 标识符绑定在这里  
      Arguments: {0: 20, 1: 30, length: 2},  
    },  
    outer: <GlobalLexicalEnvironment>  
  },

  VariableEnvironment: {  
    EnvironmentRecord: {  
      Type: "Declarative",  
      // 标识符绑定在这里  
      g: undefined  
    },  
    outer: <GlobalLexicalEnvironment>  
  }  
}
```
<span id = 'blts'></span>
`变量提升的原因`在创建阶段，函数声明存储在环境中，而变量会被设置为 undefined（在 var 的情况下）或保持未初始化（在 let 和 const 的情况下）。所以这就是为什么可以在声明之前访问 var 定义的变量（尽管是 undefined ），但如果在声明之前访问 let 和 const 定义的变量就会提示引用错误的原因。这就是所谓的变量提升

### 执行阶段
此阶段，完成对所有变量的分配，最后执行代码。

如果 Javascript 引擎在源代码中声明的实际位置找不到 let 变量的值，那么将为其分配 undefined 值。



## ES3和ES5执行上下文创建的差异
### ES3
1. 创建作用域链。
2. 创建变量对象VO(包括参数，函数，变量)。
3. 确定this的值
### ES5
1. 确定 this 的值。
2. 创建词法环境(LexicalEnvironment)
3. 创建变量环境(VariableEnvironment)  

ES3的VO，AO为什么可以被抛弃？个人认为有两个原因，第一个是在创建过程中所执行的创建作用域链和创建变量对象(VO)都可以在创建词法环境的过程中完成。第二个是针对es6中存储函数声明和变量(let 和 const)以及存储变量(var)的绑定，可以通过两个不同的过程(词法环境，变量环境)区分开来。


## 执行上下文的三个重要属性(ES3)
### 变量对象(Variable Object VO)
变量对象是与执行上下文相关的数据作用域，`存储了在上下文中定义的变量和函数声明`。  

因为不同执行上下文下的变量对象稍有不同，所以我们来聊聊全局上下文下的变量对象和函数上下文下的变量对象。
1. `全局上下文`全局上下文中的变量对象就是全局对象
2. `函数上下文`在函数上下文中，我们用**活动对象(activation object, AO)**来表示变量对象。  
:::tip
* 活动对象和变量对象其实是一个东西，只是变量对象是规范上的或者说是引擎实现上的，不可在 JavaScript 环境中访问，只有到当进入一个执行上下文中，这个执行上下文的变量对象才会被激活，所以才叫 activation object 呐，而只有被激活的变量对象，也就是活动对象上的各种属性才能被访问
* 调用函数时，会为其创建一个Arguments对象，并自动初始化局部变量arguments，指代该Arguments对象。所有作为参数传入的值都会成为Arguments对象的数组元素
* 未进入执行阶段之前，变量对象(VO)中的属性都不能访问！但是进入执行阶段之后，变量对象(VO)转变为了活动对象(AO)，里面的属性都能被访问了，然后开始进行执行阶段的操作。

它们其实都是同一个对象，只是处于执行上下文的不同生命周期
:::

#### 执行过程

执行上下文的代码会分成两个阶段进行处理  
**进入执行上下文**  

很明显，这个时候还没有执行代码，此时的变量对象会包括（如下顺序初始化）:
1. 函数的所有形参 (只有在函数上下文)：没有实参，属性值设为undefined。
2. 函数声明：如果变量对象已经存在相同名称的属性，则完全替换这个属性。
3. 变量声明：如果变量名称跟已经声明的形参或函数相同，则变量声明不会干扰已经存在的这类属性。
```js
function foo(a) {
  var b = 2;
  function c() {}
  var d = function() {};

  b = 3;
}

foo(1);
```
此时的AO是
```js
AO = {
    arguments: {
        0: 1,
        length: 1
    },
    a: 1,
    b: undefined,
    c: reference to function c(){},
    d: undefined
}
```
形参arguments这时候已经有赋值了，但是变量还是undefined，只是初始化的值

**代码执行**
这个阶段会顺序执行代码，修改变量对象的值，执行完成后AO如下
```js
AO = {
    arguments: {
        0: 1,
        length: 1
    },
    a: 1,
    b: 3,
    c: reference to function c(){},
    d: reference to FunctionExpression "d"
}
```
`总结`
* 全局上下文的变量对象初始化是全局对象

* 函数上下文的变量对象初始化只包括 Arguments 对象

* 在进入执行上下文时会给变量对象添加形参、函数声明、变量声明等初始的属性值

* 在代码执行阶段，会再次修改变量对象的属性值  
 
`思考`
1. 第一题
```js
function foo() {
    console.log(a);
    a = 1;
}

foo(); // ???

function bar() {
    a = 1;
    console.log(a);
}
bar(); // ???
```
第一段会报错：`Uncaught ReferenceError: a is not defined。`  

第二段会打印：1。  

这是因为函数中的 "a" 并没有通过 var 关键字声明，所有不会被存放在 AO 中。  

第一段执行 console 的时候， AO 的值是：
```js
AO = {
    arguments: {
        length: 0
    }
}
```
没有 a 的值，然后就会到全局去找，全局也没有，所以会报错。  

当第二段执行 console 的时候，全局对象已经被赋予了 a 属性，这时候就可以从全局找到 a 的值，所以会打印 1。





### 作用域链
当查找变量的时候，会先从当前上下文的变量对象中查找，如果没有找到，就会从父级(词法层面上的父级)执行上下文的变量对象中查找，一直找到全局上下文的变量对象，也就是全局对象。这样由多个执行上下文的变量对象构成的链表就叫做作用域链。

下面，让我们以一个函数的`创建`和`激活`两个时期来讲解作用域链是如何创建和变化的  

**函数创建**
函数的作用域在函数定义的时候就决定了。

这是因为函数有一个内部属性 [[scope]]，当函数创建的时候，就会保存所有父变量对象到其中，你可以理解 [[scope]] 就是所有父变量对象的层级链，但是注意：[[scope]] 并不代表完整的作用域链！
```js
 
function foo() {
    function bar() {
        ...
    }
}
//函数创建时，各自的[[scope]]为：
foo.[[scope]] = [
  globalContext.VO
];

bar.[[scope]] = [
    fooContext.AO,
    globalContext.VO
];
```
**函数激活**
当函数激活时，进入函数上下文，创建 VO/AO 后，就会将活动对象添加到作用链的前端。

这时候执行上下文的作用域链，我们命名为 `Scope`：
`Scope = [AO].concat([[Scope]]);`
至此，作用域链创建完毕。  

`结合着之前讲的变量对象和执行上下文栈，我们来总结一下函数执行上下文中作用域链和变量对象的创建过程：`
```js
var scope = "global scope";
function checkscope(){
    var scope2 = 'local scope';
    return scope2;
}
checkscope();
```
1. checkscope 函数被创建，保存作用域链到 内部属性[[scope]]
`checkscope.[[scope]] = [globalContext.VO];`
2. 执行 checkscope 函数，创建 checkscope 函数执行上下文，checkscope 函数执行上下文被压入执行上下文栈
```js
ECStack = [
    checkscopeContext,
    globalContext
];
```
3. checkscope 函数并不立刻执行，开始做准备工作，第一步：复制函数[[scope]]属性创建作用域链
```js
checkscopeContext = {
    Scope: checkscope.[[scope]],
}
```
4. 用 arguments 创建活动对象，随后初始化活动对象，加入形参、函数声明、变量声明
```js
checkscopeContext = {
    AO: {
        arguments: {
            length: 0
        },
        scope2: undefined
    }，
    Scope: checkscope.[[scope]],
}
```
5. 第三步：将活动对象压入 checkscope 作用域链顶端
```js
checkscopeContext = {
    AO: {
        arguments: {
            length: 0
        },
        scope2: undefined
    },
    Scope: [AO, [[Scope]]]
}
```
6. 准备工作做完，开始执行函数，随着函数的执行，修改 AO 的属性值
```js
checkscopeContext = {
    AO: {
        arguments: {
            length: 0
        },
        scope2: 'local scope'
    },
    Scope: [AO, [[Scope]]]
}
```
7. 查找到 scope2 的值，返回后函数执行完毕，函数上下文从执行上下文栈中弹出
```js
ECStack = [
    globalContext
];
```

## 前面题目的分析
```js
var scope = "global scope";
function checkscope(){
    var scope = "local scope";
    function f(){
        return scope;
    }
    return f();
}
checkscope();

var scope = "global scope";
function checkscope(){
    var scope = "local scope";
    function f(){
        return scope;
    }
    return f;
}
checkscope()();
```

### 第一段代码
1. 执行全局代码，创建全局执行上下文，全局上下文被压入执行上下文栈
`   ECStack = [globalContext];`
2. 全局上下文初始化
```js
  globalContext = {
        VO: [global],
        Scope: [globalContext.VO],
        this: globalContext.VO
    }
```
初始化的同时，checkscope 函数被创建，保存作用域链到函数的内部属性[[scope]]
```js
   checkscope.[[scope]] = [
      globalContext.VO
    ];
```
3. 执行 checkscope 函数，创建 checkscope 函数执行上下文，checkscope 函数执行上下文被压入执行上下文栈
```js
ECStack = [
        checkscopeContext,
        globalContext
    ];
```
4. checkscope 函数执行上下文初始化：

* 复制函数 [[scope]] 属性创建作用域链，
* 用 arguments 创建活动对象，
* 初始化活动对象，即加入形参、函数声明、变量声明，
* 将活动对象压入 checkscope 作用域链顶端。
同时 f 函数被创建，保存作用域链到 f 函数的内部属性[[scope]]
```js
   checkscopeContext = {
        AO: {
            arguments: {
                length: 0
            },
            scope: undefined,
            f: reference to function f(){}
        },
        Scope: [AO, globalContext.VO],
        this: undefined
    }
```
5. 执行 f 函数，创建 f 函数执行上下文，f 函数执行上下文被压入执行上下文栈
```js
   ECStack = [
        fContext,
        checkscopeContext,
        globalContext
    ];
```
6. f 函数执行上下文初始化, 以下跟第 4 步相同：

* 复制函数 [[scope]] 属性创建作用域链
* 用 arguments 创建活动对象
* 初始化活动对象，即加入形参、函数声明、变量声明
* 将活动对象压入 f 作用域链顶端
```js
  fContext = {
        AO: {
            arguments: {
                length: 0
            }
        },
        Scope: [AO, checkscopeContext.AO, globalContext.VO],
        this: undefined
    }
```
7. f 函数执行，沿着作用域链查找 scope 值，返回 scope 值
8. f 函数执行完毕，f 函数上下文从执行上下文栈中弹出
```js
    ECStack = [
        checkscopeContext,
        globalContext
    ];
```

9. checkscope 函数执行完毕，checkscope 执行上下文从执行上下文栈中弹出
```js
 ECStack = [
        globalContext
    ];
```

### 第二题

1. 执行全局代码。创建全局上下文，全局上下文被压入栈。
```js
ECStack=[
    globalContext
 ];
```
2. 全局上下文初始化:
```js
globalContext = {  
     VO: [global],
     Scope: [globalContext.VO],
     this: undefined
}
```
初始化上下文的同时，创建checkscope函数，保存作用域到函数内部[[scope]]属性。
```js
checkscope.[[scope]] = [
    globalContext.VO
];
```
3. 执行checkscope函数。创建checkscope函数上下文，函数上下文被压入栈。
```js
ECStack=[
    checkscopeContext,
    globalContext
 ];
```
4. checkscope函数执行上下文初始化：
* 复制函数 [[scope]] 属性创建作用域链，
* 用 arguments 创建活动对象，
* 初始化活动对象，即加入形参、函数声明、变量声明，
* 将活动对象压入 checkscope 作用域链顶端。
同时 f 函数被创建，保存作用域链到 f 函数的内部属性[[scope]]
```js
checkscopeContext = {  
     AO:  {
         arguments: {
             length: 0
         },
         scope: undefined,
         f: reference to function f(){}
     },
     Scope: [AO, globalContext.VO],
     this: undefined
}
```
5. checkscope 函数执行完毕，checkscope 执行上下文从执行上下文栈中弹出。
```js
ECStack=[
    globalContext
 ];
```
6. 执行f函数，创建f函数上下文，上下文被压入栈。
```js
ECStack=[
    fContext,
    globalContext
 ];
```
7. f函数执行上下文初始化。
* 复制函数 [[scope]] 属性创建作用域链，
* 用 arguments 创建活动对象，
* 初始化活动对象，即加入形参、函数声明、变量声明，
* 将活动对象压入 checkscope 作用域链顶端。
```js
fContext = {  
     AO:  {
         arguments: {
             length: 0
         }
     },
     Scope: [AO, checkscopeContext.AO, globalContext.VO],
     this: undefined
}
```
8. f 函数执行，沿着作用域链查找 scope 值，返回 scope 值
9. f 函数执行完毕，f 函数上下文从执行上下文栈中弹出
```js
ECStack = [
        globalContext
    ];
```