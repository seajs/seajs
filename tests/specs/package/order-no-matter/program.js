define("package/order-no-matter/math",[],function(a,b){b.add=function(){var a=0,b=0,c=arguments.length;while(b<c)a+=arguments[b++];return a}});
define("package/order-no-matter/program",["package/order-no-matter/increment","package/order-no-matter/math"],function(a,b){var c=a("package/order-no-matter/increment").increment;b.result=c(10)});
define("package/order-no-matter/increment",["package/order-no-matter/math"],function(a,b){var c=a("package/order-no-matter/math").add;b.increment=function(a){return c(a,1)}});
