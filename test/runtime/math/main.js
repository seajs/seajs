define("main",["../../test","increment"],function(a){var b=a("../../test"),c=a("./increment").increment;b.assert(c(1)===2,"The result of inc(1) is 2."),b.done()});
define("increment",["math"],function(a,b){var c=a("./math").add;b.increment=function(a){return c(a,1)}});
define("math",[],function(a,b){b.add=function(){var a=0,b=0,c=arguments.length;while(b<c)a+=arguments[b++];return a}});