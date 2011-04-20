module.declare(function(require, exports, module) {

  exports.sayHello = function() {
    document.getElementById('out').innerHTML = '<span style="color: green">It works!</span> - from sub';
  };

});
