define("jn/hello_world", function(require, exports, module){
    var tpl = require('./hello_world.html');
    console.log(tpl);
});
seajs.use(["jn/hello_world"],
function(Action) {
  console.log(Action);
});