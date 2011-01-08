/*
Copyright 2011, SeaJS v0.1.0
MIT Licensed
build time: Jan 8 23:50
*/
var S=S||{};S.version="0.1.0";S.global=this;S.DEBUG=false;S.log=function(b,c){if(S.DEBUG){var a=S.global.console;if(a&&a.log)a[c&&a[c]?c:"log"](b)}};S.error=function(b){if(S.DEBUG)throw b;};S.type=function(){for(var b=["Boolean","Number","String","Function","Array","Date","RegExp","Object"],c={},a=0;a<b.length;a++){var d=b[a];c["[object "+d+"]"]=d.toLowerCase()}return function(e){return e==null?String(e):c[Object.prototype.toString.call(e)]||"object"}}();
(function(){var b=function(){},c=S.ModuleLoader={baseUrl:"",importModule:b,importingModule:null,main:null};c.Module=function(a,d){this.id=a;this.uri=d||c.baseUrl+a+".js";this.require=b;this.exports={}};S.declare=function(a){var d=c.importingModule;d.factory=a;a.call(d,d.require,d.exports,d)}})();
(function(b){function c(e,g){e.addEventListener("load",g,false)}document.createElement("script").addEventListener||(c=function(e,g){var f=e.onreadystatechange;e.onreadystatechange=function(){var h=e.readyState;if(h==="loaded"||h==="complete"){e.onreadystatechange=null;f&&f();g.call(this)}}});var a=document.getElementsByTagName("script"),d=a[a.length-1];a=d.src;d=d.getAttribute("data-main");b.baseUrl=a.substring(0,a.lastIndexOf("/")+1);b.importModule=function(e,g){var f=document.createElement("script"),
h=document.getElementsByTagName("head")[0];f.src=e;f.async=true;c(f,function(){g&&g.call(f);h.removeChild(f)});h.insertBefore(f,h.firstChild)};if(d)b.main=new b.Module(d)})(S.ModuleLoader);(function(b){var c=b.main;if(c){b.importingModule=c;b.importModule(c.uri)}})(S.ModuleLoader);
