define(function(require, exports) {

  exports.sayHello = function() {
    var str = document.createTextNode('Hello, SeaJS!');
    document.body.appendChild(str);
  };

});
