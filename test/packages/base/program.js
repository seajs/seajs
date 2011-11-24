seajs.config({ base: location.href.replace(/(.*\/)([^\/]+)/, '$1') + 'packages/base' });
seajs.config({ alias: { 'appUrl': location.href.replace(/(.*\/)([^\/]+)/, '$1') + 'packages/base' } });
define("appUrl/program",["../../test","./increment"],function(a){var b=a("../../test"),c=a("./increment").increment;b.assert(c(1)===2,"The result of inc(1) is 2."),b.done()});
define("appUrl/increment",["math"],function(a,b){var c=a("math").add;b.increment=function(a){return c(a,1)}});