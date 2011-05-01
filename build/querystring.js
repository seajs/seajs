/*
Copyright 2011, SeaJS v0.9.0dev
MIT Licensed
build time: ${build.time}
*/

define(function(){function k(a){var d=typeof a;return a==null||d!=="object"&&d!=="function"}var f={},l=Object.prototype.toString,m=String.prototype.trim,n=Object.prototype.hasOwnProperty,o=Array.isArray?Array.isArray:function(a){return l.call(a)==="[object Array]"},j=m?function(a){return a==null?"":m.call(a)}:function(a){return a==null?"":a.toString().replace(/^\s+/,"").replace(/\s+$/,"")};f.escape=encodeURIComponent;f.unescape=function(a){return decodeURIComponent(a.replace(/\+/g," "))};f.stringify=
function(a,d,h,g){if(!a||!(l.call(a)==="[object Object]"&&"isPrototypeOf"in a))return"";var d=d||"&",h=h||"=",g=g||!1,e=[],b,c;for(b in a)if(n.call(a,b))if(c=a[b],b=f.escape(b),k(c))e.push(b,h,f.escape(c+""),d);else if(o(c)&&c.length)for(var i=0;i<c.length;i++)k(c[i])&&e.push(b,(g?f.escape("[]"):"")+h,f.escape(c[i]+""),d);else e.push(b,h,d);e.pop();return e.join("")};f.parse=function(a,d,h){var g={};if(typeof a!=="string"||j(a).length===0)return g;h=h||"=";a=a.split(d||"&");for(d=0;d<a.length;d++){var e=
a[d],b=e.indexOf(h);if(b===-1)b=e.length;var c=f.unescape(j(e.slice(0,b))),e=f.unescape(j(e.slice(b+h.length)));(b=c.match(/^(\w+)\[\]$/))&&b[1]&&(c=b[1]);n.call(g,c)?(o(g[c])||(g[c]=[g[c]]),g[c].push(e)):g[c]=b?[e]:e}return g};f.version="1.0.0";return f});
