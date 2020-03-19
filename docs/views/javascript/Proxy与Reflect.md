---
title: Proxy与Reflect
date: 2018-12-15
tags:
 - ES6 
 - proxy 
 - reflect
categories:
 -  JavaScript
sidebar: auto
---

## Proxy
Proxy是一种元编程即对编程语言的编程，在目标对象之前假设一层拦截可以对外界的访问进行过滤和改写，代理，拦截Js中默认行为
`var proxy = new Proxy(target , handle)`

```js
var handler = {
    get: function(target, name) {
        if(name === 'prototype') {
            return Object.prototype;
        }
        return 'Hello, '+name;
    },
    apply: function(target, thisBinding, args) {
        return args[0];
    },
    construct: function(target, args) {
        return { value: args[1] };
    }
};

var fproxy = new Proxy(function(x,y) {
    return x + y;
}, handler);

fproxy(1, 2);  // 1
new fproxy(1, 2);  // { value: 2 }
fproxy.prototype === Object.prototype;   // true
fproxy.foo;   // 'Hello, foo'
```

1. 调用行为 `apply`拦截函数调用 `constructor`拦截new
2. 属性访问 `get` `set` `has` `getProtypeOf` `ownKeys` 
3. 静态方法 `defineProperty`  `definproperty`  `deleteProperty`  `getOwnPropertyDescriptor`  `isExtensible`  `preventExtensions`  `setPrototypeOf` 


## Reflect 
Proxy提供拦截，Reflect提供修改

1. 将Object上明显属于语言内部的方法放到了Reflect上（defineProperty） 即从Reflect对象上拿Object对象内部方法。

2. 将用 老Object方法 报错的情况，改为返回false 让返回结果更合理
`Object.defineProperty()`无法定义时会抛错，Reflect会返回false

3. 让Object操作变成函数行为
`'name' in Object   //true` 改成 `Reflect.has(Object,'name') //true` 
` delete Object[name]` 改成 `Reflect.deleteProperty(Object,'name') //true` 

4. Reflect与Proxy是相辅相成的，在Proxy上有的方法，在Reflect就一定有
使Proxy可以方便调用对应的Reflect来完成默认行为作为修改的基础，保证原生行为能正常

