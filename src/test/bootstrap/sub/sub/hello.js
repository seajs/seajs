define(function(require, exports) {

  exports.sayHello = function() {
    document.getElementById('out').innerHTML = '<span style="color: green">It works!</span> - from sub';
  };

});
