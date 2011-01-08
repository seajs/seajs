/*
Copyright 2011, SeaJS v0.1.0
MIT Licensed
build time: Jan 8 19:21
*/
var S=S||{};S.version="0.1.0";S.global=this;S.DEBUG=false;S.log=function(b,c){if(S.DEBUG){var a=S.global.console;if(a&&a.log)a[c&&a[c]?c:"log"](b)}};S.error=function(b){if(S.DEBUG)throw b;};S.type=function(){for(var b=["Boolean","Number","String","Function","Array","Date","RegExp","Object"],c={},a=0;a<b.length;a++){var e=b[a];c["[object "+e+"]"]=e.toLowerCase()}return function(d){return d==null?String(d):c[Object.prototype.toString.call(d)]||"object"}}();
