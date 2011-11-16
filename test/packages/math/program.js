seajs.config({ alias: { 's_auto_pkg_1': location.href.replace(/(.*\/)([^\/]+)/, '$1') + 'packages/math' } });
define("s_auto_pkg_1/program",["../../test","./increment"],function(a){var b=a("../../test"),c=a("./increment").increment;b.assert(c(1)===2,"The result of inc(1) is 2."),b.done()});
define("s_auto_pkg_1/increment",["./math"],function(a,b){var c=a("./math").add;b.increment=function(a){return c(a,1)}});
define("s_auto_pkg_1/math",[],function(a,b){b.add=function(){var a=0,b=0,c=arguments.length;while(b<c)a+=arguments[b++];return a}});