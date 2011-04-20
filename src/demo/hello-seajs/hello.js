define(function(require, exports) {

  exports.sayHello = function() {
    var str = document.createTextNode('你好，SeaJS!');
    document.body.appendChild(str);
  };

});
