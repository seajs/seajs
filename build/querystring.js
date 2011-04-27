/*
Copyright 2011, SeaJS v0.9.0dev
MIT Licensed
build time: ${build.time}
*/

define(function(j){function k(a){var c=typeof a;return a===null||c!=="object"&&c!=="function"}var f={},l=Object.prototype.toString,m=String.prototype.trim,n=Array.isArray?Array.isArray:function(a){return l.call(a)==="[object Array]"},o=m?function(a){return a==j?"":m.call(a)}:function(a){return a==j?"":a.toString().replace(/^\s+|\s+$/g,"")};f.escape=encodeURIComponent;f.unescape=decodeURIComponent;f.stringify=function(a,c,h,d){if(!a||!(l.call(a)==="[object Object]"&&"isPrototypeOf"in a))return"";var c=
c||"&",h=h||"=",d=d||!1,i=[],e,b;for(e in a)if(b=a[e],e=f.escape(e),k(b))i.push(e,h,f.escape(b+""),c);else if(n(b)&&b.length)for(var g=0,j=b.length;g<j;++g)k(b[g])&&i.push(e,(d?"[]":"")+h,f.escape(b[g]+""),c);i.pop();return i.join("")};f.parse=function(a,c,h){var d={};if(typeof a!=="string"||(a=o(a)).length===0)return d;for(var a=a.split(c||"&"),c=0,i=a.length;c<i;++c){var e=a[c].split(h||"="),b=f.unescape(e[0]),e=f.unescape(e[1]||""),g=b.match(/^(\w+)\[\]$/);g&&g[1]&&(b=g[1]);d.hasOwnProperty(b)?
(n(d[b])||(d[b]=[d[b]]),d[b].push(e)):d[b]=e}return d};f.version="1.0.0";return f});
