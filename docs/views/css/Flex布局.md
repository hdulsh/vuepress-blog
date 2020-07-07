---
title: Flex布局
date: 2020-03-09
tags:
 - Flex
categories:
 -  CSS
sidebar: auto
---

![](https://resource.limeili.co/abstract/abstract%20(55).jpg)
<!-- more -->

## 容器的属性(6)
* flex-direction
* flex-wrap
* flex-flow
* justify-content
* align-items
* align-content
###  flex-direction  
主轴的方向（即项目的排列方向）  
`row | row-reverse | column | column-reverse`
### flex-wrap
默认情况下，项目都排在一条线（又称"轴线"）上。flex-wrap属性定义，如果一条轴线排不下，如何换行  
`nowrap | wrap(第一行在上方) | wrap-reverse(第一行在下方);`
### flex-flow  
是flex-direction属性和flex-wrap属性的简写形式，默认值为`row nowrap`  
### justify-content(5)
定义了项目在主轴上的对齐方式  
`flex-start | flex-end | center | space-between | space-around;`

### align-items(5)
定义项目在交叉轴上如何对齐  
`flex-start | flex-end | center | baseline(项目的第一行文字的基线对齐) | stretch`  
默认值stretch如果项目未设置高度或设为auto，将占满整个容器的高度  
### align-content  
定义了多根轴线的对齐方式。如果项目只有一根轴线，该属性不起作用。  
`flex-start | flex-end | center | space-between | space-around | stretch;`  

## 项目的属性(6)
* order
* flex-grow
* flex-shrink
* flex-basis
* flex
* align-self  
### order
定义项目的排列顺序。数值越小，排列越靠前，默认为0
### flex-grow  
定义项目的放大比例，默认为0，即如果存在剩余空间，也不放大

### flex-shrink  
定义了项目的缩小比例，默认为1，即如果空间不足，该项目将缩小  
如果所有项目的flex-shrink属性都为1，当空间不足时，都将等比例缩小。如果一个项目的flex-shrink属性为0，其他项目都为1，则空间不足时，前者不缩小
### flex-basis  
定义了在分配多余空间之前，项目占据的主轴空间（main size）。浏览器根据这个属性，计算主轴是否有多余空间。它的默认值为auto，即项目的本来大小  
它可以设为跟width或height属性一样的值（比如350px），则项目将占据固定空间  

### flex 
flex属性是flex-grow, flex-shrink 和 flex-basis的简写，默认值为`0 1 auto`。后两个属性可选  
### align-self(6)
align-self属性允许单个项目有与其他项目不一样的对齐方式，可覆盖align-items属性。默认值为auto，表示继承父元素的align-items属性，如果没有父元素，则等同于stretch  
` auto | flex-start | flex-end | center | baseline | stretch;`  

## 骰子的布局

![](https://resource.limeili.co/image/202007071534.png)
![](https://resource.limeili.co/image/202007071547.png)
![](https://resource.limeili.co/image/202007071600.png)
![](https://resource.limeili.co/image/202007071607.png)

## 网格布局
```css
//基本网格布局
 .main{
            display:flex;
            background: red;
        }
        .item{
            margin:10px;
            height:100px;
            flex:1;
            background: rebeccapurple;
        }


//百分比布局
  <div class="main">
        <div class="item l50"></div>
        <div class="item"></div>
        <div class="item"></div>
    </div>
 .main{
            display:flex;
            background: red;
        }
        .item{
            margin:10px;
            height:100px;
            flex:1;
            background: rebeccapurple;
        }
        .l50{
            flex:0 0 50%
        }
```

## 圣杯布局
```html
<style>
  #header, #footer {
    background: rgba(29, 27, 27, 0.726);
    text-align: center;
    height: 60px;
    line-height: 60px;
  }
  #container {
   display: flex;
  }
  #container .column {
    text-align: center;
    height: 300px;
    line-height: 300px;
  }
  #center {
    flex: 1;
    background: rgb(206, 201, 201);
  }
  #left {
    width: 200px;        
    background: rgba(95, 179, 235, 0.972);
  }
  #right {
    width: 150px;           
    background: rgb(231, 105, 2);
  }

</style>
</head>
<body>
    <div class="container">
        <div id="header">#header</div>
        <div id="container">
            <div id="left" class="column">#left</div>
            <div id="center" class="column">#center</div>
            <div id="right" class="column">#right</div>
        </div>
        <div id="footer">#footer</div>
    </div>
  
</body>
```

## 流式布局
```html
<div class="parent">
    <div class="child">1</div>
    <div class="child">2</div>
    <div class="child">3</div>
    <div class="child">4</div>
    <div class="child">5</div>
    <div class="child">6</div>
    <div class="child">7</div>
    <div class="child">8</div>
    <div class="child">9</div>
    <div class="child">10</div>
</div>
<style>  
 .parent {
  width: 200px;
  height: 150px;
  background-color: black;
  display: flex;
  flex-flow: row wrap;
  align-content: flex-start;
}

.child {
  box-sizing: border-box;
  background-color: white;
  flex: 0 0 25%;
  height: 50px;
  border: 1px solid red;
}
</style>  
```

## 固定底栏
```html
<body class="Site">
  <header>...</header>
  <main class="Site-content">...</main>
  <footer>...</footer>
</body>
```
```css

.Site {
  display: flex;
  min-height: 100vh;
  flex-direction: column;
}

.Site-content {
  flex: 1;
}
```