---
title: ajax axios fetch的封装.md
date: 2020-05-31
tags:
 - ajax
categories:
 -  JavaScript
sidebar: auto
---

![](https://resource.limeili.co/abstract/abstract%20(36).jpg)
<!-- more -->

## JQ版ajax库
```js
~ function () {
    function ajax(options) {
        return new init(options);
    }

    /* ==AJAX处理的核心== */
    let regGET = /^(GET|DELETE|HEAD|OPTIONS)$/i;
    let defaults = {
        url: '', //=>请求的API接口地址
        method: 'GET', //=>请求方式
        data: null, //=>传递给服务器的信息：支持格式STRING和OBJECT，如果是OBJECT，我们需要把其处理为x-www-form-urlencoded格式；GET请求是把信息作为问号参数传递给服务器，POST请求是放到请求主体中传递给服务器；
        dataType: 'JSON', //=>处理返回结果 JSON/TEXT/XML
        async: true, //=>是否异步请求
        cache: true, //=>清除GET请求缓存
        timeout: null, //=>超时时间
        headers: null, //=>设置请求头信息
        success: null, //=>从服务器获取成功后执行
        error: null //=>获取失败后执行
    };

    function init(options = {}) {
        //=>参数初始化：把传递的配置项替换默认的配置项
        this.options = Object.assign(defaults, options);
        this.xhr = null;
        this.send();
    }

    ajax.prototype = {
        constructor: ajax,
        version: 1.0,
        //=>发送AJAX请求
        send() {
            let xhr = null,
                {
                    url,
                    method,
                    async,
                    data,
                    cache,
                    timeout,
                    dataType,
                    headers,
                    success,
                    error
                } = this.options;
            this.xhr = xhr = new XMLHttpRequest;

            //=>如果是GET请求把处理后的DATA放在URL末尾传递给服务器
            data = this.handleData();
            if (data !== null && regGET.test(method)) {
                url += `${this.checkASK(url)}${data}`;
                data = null;
            }

            //=>处理CACHE:如果是GET并且CACHE是FALSE需要清除缓存
            if (cache === false && regGET.test(method)) {
                url+=`${this.checkASK(url)}_=${Math.random()}`;
            }

            xhr.open(method, url, async);

            //=>超时处理
            timeout !== null ? xhr.timeout = timeout : null;

            //=>设置请求头信息
            if (Object.prototype.toString.call(headers) === "[object Object]") {
                for (let key in headers) {
                    if (!headers.hasOwnProperty(key)) break;
                    xhr.setRequestHeader(key, encodeURIComponent(headers[key]));
                }
            }

            xhr.onreadystatechange = () => {
                let {
                    status,
                    statusText,
                    readyState: state,
                    responseText,
                    responseXML
                } = xhr;
                if (/^(2|3)\d{2}$/.test(status)) {
                    //=>成功
                    if (state === 4) {
                        switch (dataType.toUpperCase()) {
                            case 'JSON':
                                responseText = JSON.parse(responseText);
                                break;
                            case 'XML':
                                responseText = responseXML;
                                break;
                        }
                        success && success(responseText, statusText, xhr);
                    }
                    return;
                }
                //=>失败的
                typeof error === "function" ? error(statusText, xhr) : null;
            }
            xhr.send(data);
        },
        //=>关于DATA参数的处理
        handleData() {
            let {
                data
            } = this.options;
            if (data === null || typeof data === "string") return data;
            let str = ``;
            for (let key in data) {
                if (!data.hasOwnProperty(key)) break;
                str += `${key}=${data[key]}&`;
            }
            str = str.substring(0, str.length - 1);
            return str;
        },
        //=>检测URL中是否存在问号
        checkASK(url) {
            return url.indexOf('?') === -1 ? '?' : '&';
        }
    };
    init.prototype = ajax.prototype;
    window._ajax = ajax;
}();
```

## 基于PROMISE封装自己的AJAX库
```js
(function anonymous() {
    let isObj = function isObj(val) {
        return val !== null && typeof val === "object";
    };

    let char = function char(url) {
        return url.includes('?') ? '&' : '?';
    };

    /* ===AJAX核心处理=== */
    class MyAJAX {
        constructor(options = {}) {
            this.config = options;
            this.ISGET = /^(GET|DELETE|HEAD|OPTIONS)$/i.test(options.method);
            return this.init();
        }
        init() {
            let transformRequest = this.config.transformRequest;
            if (typeof transformRequest === "function") {
                this.config = transformRequest(this.config);
            }
            // 按照最新的CONFIG处理即可
            let {
                method,
                validateStatus,
                transformResponse,
                withCredentials
            } = this.config;
            !Array.isArray(transformResponse) ? transformResponse = [null, null] : null;
            return new Promise((resolve, reject) => {
                // 发送AJAX请求
                let xhr = new XMLHttpRequest;
                xhr.open(method, this.handleURL());
                this.handleHeaders(xhr);
                xhr.withCredentials = withCredentials;
                xhr.onreadystatechange = () => {
                    if (xhr.readyState === 2) {
                        let flag = validateStatus(xhr.status);
                        if (!flag) {
                            reject(this.handleResult(xhr, false));
                            return;
                        }
                    }
                    if (xhr.readyState === 4) {
                        resolve(this.handleResult(xhr, true));
                    }
                };
                xhr.send(this.handleData());
            }).then(...transformResponse);
        }
        // URL处理:CACHE/PARAMS
        handleURL() {
            let {
                url,
                baseURL,
                cache,
                params
            } = this.config;
            url = baseURL + url;
            if (this.ISGET) {
                if (isObj(params)) {
                    let paramsText = ``;
                    for (let key in params) {
                        if (!params.hasOwnProperty(key)) break;
                        paramsText += `&${key}=${params[key]}`;
                    }
                    paramsText = paramsText.substring(1);
                    url += char(url) + paramsText;
                }
                if (cache === false) {
                    url += `${char(url)}_=${new Date().getTime()}`;
                }
            }
            return url;
        }
        // 设置请求头信息
        handleHeaders(xhr) {
            let {
                headers
            } = this.config;
            if (isObj(headers)) {
                for (let key in headers) {
                    if (!headers.hasOwnProperty(key)) break;
                    xhr.setRequestHeader(key, headers[key]);
                }
            }
        }
        // 请求主体的值
        handleData() {
            if (this.ISGET) return null;
            let data = this.config.data;
            if (isObj(data)) {
                data = JSON.stringify(data);
            }
            return data;
        }
        // 获取返回的信息
        handleResult(xhr, flag) {
            // 获取响应头信息
            let headers = {};
            xhr.getAllResponseHeaders().split(/(?:\n|\r)/g).filter(item => item.length > 0).forEach(item => {
                let [key, value = ''] = item.split(': ');
                key ? headers[key] = value : null;
            });

            if (flag) {
                let responseType = this.config.responseType;
                let data = xhr.responseText;
                switch (responseType.toLowerCase()) {
                    case 'json':
                        data = JSON.parse(data);
                        break;
                    case 'xml':
                        data = xhr.responseXML;
                        break;
                }
                return {
                    status: xhr.status,
                    statusText: xhr.statusText,
                    headers,
                    request: xhr,
                    config: this.config,
                    data
                };
            }
            return {
                status: xhr.status,
                statusText: xhr.statusText,
                headers,
                request: xhr,
                config: this.config
            };
        }
    }

    /* ===配置出_AJAX应有的接口并暴露到全局上=== */
    function initParams(options = {}) {
        !isObj(_ajax.defaults.headers) ? _ajax.defaults.headers = {} : null;
        !isObj(options.headers) ? options.headers = {} : null;
        options.headers = Object.assign(_ajax.defaults.headers, options.headers);
        return Object.assign(_ajax.defaults, options);
    }

    // _AJAX执行发送请求
    function _ajax(options = {}) {
        options = initParams(options);
        return new MyAJAX(options);
    }

    // 默认的参数配置信息
    _ajax.defaults = {
        baseURL: '',
        url: '',
        method: 'get',
        responseType: 'json',
        withCredentials: false,
        cache: true,
        params: null,
        data: null,
        headers: {
            "Content-Type": "application/json"
        },
        transformRequest: null,
        transformResponse: null,
        validateStatus: status => {
            return status >= 200 && status < 300;
        }
    };

    // _AJAX的快捷请求方法
    ['get', 'delete', 'head', 'options'].forEach(item => {
        _ajax[item] = function (url, options = {}) {
            options.url = url;
            options.method = item;
            options = initParams(options);
            return new MyAJAX(options);
        };
    });
    ['post', 'put'].forEach(item => {
        _ajax[item] = function (url, data = {}, options = {}) {
            options.url = url;
            options.method = item;
            options.data = data;
            options = initParams(options);
            return new MyAJAX(options);
        };
    });
    _ajax.all = function all(promiseArr = []) {
        return Promise.all(promiseArr);
    };
    window._ajax = _ajax;
})();
```
## axios的二次配置
```js
import axios from 'axios';
import qs from 'qs';

/* 
 * 根据环境变量进行接口区分
 */
switch (process.env.NODE_ENV) {
    case "development":
        axios.defaults.baseURL = "http://127.0.0.1:9000";
        break;
    case "test":
        axios.defaults.baseURL = "http://192.168.20.15:9000";
        break;
    case "production":
        axios.defaults.baseURL = "http://api.zhufengpeixun.cn";
        break;
}

/*
 * 设置超时请求时间 
 */
axios.defaults.timeout = 10000;

/*
 * 设置CORS跨域允许携带资源凭证  [krəˈdenʃlz] 
 */
axios.defaults.withCredentials = true;

/*
 * 设置POST请求头：告知服务器请求主体的数据格式
 */
axios.defaults.headers['Content-Type'] = 'application/x-www-form-urlencoded';
axios.defaults.transformRequest = data => qs.stringify(data);

/*
 * 设置请求拦截器  [ˌɪntərˈsɛptərz]
 */
axios.interceptors.request.use(config => {
    const token = localStorage.getItem('token');
    token && (config.headers.Authorization = token);
    return config;
});

/*
 * 设置响应拦截器 
 */
axios.defaults.validateStatus = status => {
    return /^(2|3)\d{2}$/.test(status);
};
axios.interceptors.response.use(response => {
    return response.data;
}, error => {
    if (error.response) {
        // 请求已发送，只不过状态码不是200系列，设置不同状态码的不同处理
        switch (error.response.status) {
            case 401: // 当前请求需要用户验证（一般是未登录）
                break;
            case 403: // 服务器拒绝执行（一般是TOKEN过期）
                break;
            case 404: // 请求失败，请求地址错误
                break;
        }
        return Promise.reject(error.response);
    } else {
        if (!window.navigator.onLine) {
            // 断开网络了，可以让其跳转到断网页面
            return;
        }
        return Promise.reject(error);
    }
});
export default axios;
```
## fetch的封装
```js
import qs from 'qs';
let baseURL = 'http://api.zhufengpeixun.cn';
export default function request(url, options = {}) {
    url = baseURL + url;

    /*
     * GET系列请求的处理 
     */
    !options.method ? options.method = 'GET' : null;
    if (options.hasOwnProperty('params')) {
        if (/^(GET|DELETE|HEAD|OPTIONS)$/i.test(options.method)) {
            const ask = url.includes('?') ? '&' : '?';
            url += `${ask}${qs.stringify(params)}`;
        }
        delete options.params;
    }

    /*
     * 合并配置项 
     */
    options = Object.assign({
        // 允许跨域携带资源凭证 same-origin同源可以  omit都拒绝
        credentials: 'include',
        // 设置请求头
        headers: {}
    }, options);
    options.headers.Accept = 'application/json';

    /*
     * token的校验
     */
    const token = localStorage.getItem('token');
    token && (options.headers.Authorization = token);

    /*
     * POST请求的处理
     */
    if (/^(POST|PUT)$/i.test(options.method)) {
        !options.type ? options.type = 'urlencoded' : null;
        if (options.type === 'urlencoded') {
            options.headers['Content-Type'] = 'application/x-www-form-urlencoded';
            options.body = qs.stringify(options.body);
        }
        if (options.type === 'json') {
            options.headers['Content-Type'] = 'application/json';
            options.body = JSON.stringify(options.body);
        }
    }

    return fetch(url, options).then(response => {
        // 返回的结果可能是非200状态码
        if (!/^(2|3)\d{2}$/.test(response.status)) {
            switch (response.status) {
                case 401:
                    break;
                case 403:
                    break;
                case 404:
                    break;
            }
            return Promise.reject(response);
        }
        return response.json();
    }).catch(error => {
        if (!window.navigator.onLine) {
            // 断开网络了，可以让其跳转到断网页面
            return;
        }
        return Promise.reject(error);
    });
};
```