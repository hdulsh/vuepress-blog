---
title: BFC
date: 2020-03-09
tags:
 - BFC
categories:
 -  CSS
sidebar: auto
---

![](https://resource.limeili.co/abstract/abstract%20(53).jpg)
<!-- more -->
## 什么是BFC
Formatting context 是 W3C CSS2.1 规范中的一个概念。它是页面中的一块渲染区域，并且有一套渲染规则，它决定了其子元素将如何定位，以及和其他元素的关系和相互作用。最常见的 Formatting context 有 Block fomatting context (简称BFC)和 Inline formatting context (简称IFC)。Block formatting context直译为"块级格式化上下文"。它是一个独立的渲染区域，只有Block-level box参与， 它规定了内部的Block-level Box如何布局，并且与这个区域外部毫不相干。通俗地讲，BFC是一个容器，用于管理块级元素。  
**用于决定盒子的布局及浮动相互影响范围的一个区域**  
`BFC的范围`:包含创建该上下文元素的所有子元素，但不包括创建新BFC的子元素  

## 如何创建BFC
1. float不为none
2. position为absolute或fixed
3. display 为table-cell|table-caption|inline-block|inline-flex|**flex**
4. overflow为 hidden|auto|scroll
5. 根元素

## BFC特性
1. 内部的盒子会在垂直方向，一个接一个地排列(即块级元素独占一行)
2. 同一个BFC中垂直方向上边距重叠
3. 每个元素的margin-box左边与border-box左边相接触
4. BFC就是页面上的一个隔离的独立容器，容器里面的子元素不会影响到外面的元素。反之也如此。
5. 计算BFC的高度时，浮动元素也参与计算  
6. 浮动盒区域不会叠加在BFC上

## 应用
1. 防止边距重叠
```js
<div class="p"></div>  

<div class="wrap">  
  <div class="p"></div>  
</div> 
```

2. BFC 可以包含浮动的元素（清除浮动）
正常情况下，浮动的元素会脱离普通文档流，使父元素高度坍塌。即外层的div会无法包含内部浮动的div。  


但如果我们触发外部容器的BFC，根据BFC规范中的第4条：计算BFC的高度时，浮动元素也参与计算，那么外部div容器就可以包裹着浮动元素。

3. 自适应两栏布局
```js
<div class="left"></div>
<div class="right"></div>
<style>
  .left{
background:yellow;
width:200px;
height:400px;
float:left;
}
.right{
background:pink;
height:400px;
/*添加overflow:hidden，触发元素BFC*/
overflow:hidden;
}
</style>


```



