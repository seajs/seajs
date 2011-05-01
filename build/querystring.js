/*
Copyright 2011, SeaJS v0.9.0dev
MIT Licensed
build time: ${build.time}
*/

define(function(){function k(a){var c=typeof a;return a==null||c!=="object"&&c!=="function"}var e={},l=Object.prototype.toString,m=String.prototype.trim,n=Object.prototype.hasOwnProperty,o=Array.isArray?Array.isArray:function(a){return l.call(a)==="[object Array]"},j=m?function(a){return a==null?"":m.call(a)}:function(a){return a==null?"":a.toString().replace(/^\s+/,"").replace(/\s+$/,"")};e.escape=encodeURIComponent;e.unescape=function(a){return decodeURIComponent(a.replace(/\+/g," "))};e.stringify=
function(a,c,h,f){if(!a||!(l.call(a)==="[object Object]"&&"isPrototypeOf"in a))return"";var c=c||"&",h=h||"=",f=f||!1,g=[],b,d;for(b in a)if(n.call(a,b))if(d=a[b],b=e.escape(b),k(d))g.push(b,h,e.escape(d+""),c);else if(o(d)&&d.length)for(var i=0;i<d.length;i++)k(d[i])&&g.push(b,(f?e.escape("[]"):"")+h,e.escape(d[i]+""),c);else g.push(b,h,c);g.pop();return g.join("")};e.parse=function(a,c,h){var f={};if(typeof a!=="string"||j(a).length===0)return f;a=a.split(c||"&");h=h||"=";for(c=0;c<a.length;c++){var g=
a[c].split(h),b=e.unescape(j(g[0])),g=e.unescape(j(g.slice(1).join(h))),d=b.match(/^(\w+)\[\]$/);d&&d[1]&&(b=d[1]);n.call(f,b)?(o(f[b])||(f[b]=[f[b]]),f[b].push(g)):f[b]=d?[g]:g}return f};e.version="1.0.0";return e});
