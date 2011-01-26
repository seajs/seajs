module.declare('program', ['test/test', './biz/increment'], function(require) {

  var test = require('test/test');
  var inc = require('./increment').increment;

  test.assert(inc(1) === 2, 'The result of inc(1) is 2.');
  test.print('DONE', 'info');

});


module
    .prefix('sci', '../lib/science')
    .declare('biz/increment', ['sci/math'], function(require, exports, module) {

  var add = require('sci/math').add;

  exports.increment = function(val) {
    return add(val, 1);
  }

});

module.declare('lib/science/math', [], function(require, exports, module) {

  exports.add = function() {
    var sum = 0, i = 0, l = arguments.length;
    while(i < l) {
      sum += arguments[i++];
    }
    return sum;
  }

});
