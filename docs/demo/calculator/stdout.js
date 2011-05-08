
define(function(require, exports) {

  var $ = require('jquery');

  var resultEl;
  var operatorEl;


  exports.init = function() {
    resultEl = $('#result');
    operatorEl = $('#operator');
  };

  exports.updateResult = function(val) {
    resultEl.text(val);
  };

  exports.updateOperator = function(val) {
    operatorEl.text(val);
  };

  exports.clear = function() {
    exports.updateResult('0');
    exports.updateOperator('');
  };

});
