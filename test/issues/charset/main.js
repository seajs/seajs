
seajs.config({

  charset: function(url) {
    if (url.indexOf('a.js') > 0) {
      return 'gbk';
    }
    return 'utf-8';
  }

});


define(function(require) {

  var test = require('../../test');

  var a = require('./a.js');
  var b = require('./b.js');

  test.assert(a.message === '你好 GBK', 'GBK');
  test.assert(b.message === '你好 UTF-8', 'UTF-8');

  test.done();

});

