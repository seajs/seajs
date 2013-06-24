define(function(require) {

  var test = require('../../test')
  var assert = test.assert


  // var BASE_RE = /^(.+?\/)(\?\?)?(seajs\/)+/

  assert('http://test.com/seajs/sea.js'.match(BASE_RE)[1] === 'http://test.com/', 'BASE_RE')
  assert('http://test.com/seajs/2.1.0/sea.js'.match(BASE_RE)[1] === 'http://test.com/', 'BASE_RE')
  assert('http://test.com/seajs/seajs/2.1.0/sea.js'.match(BASE_RE)[1] === 'http://test.com/', 'BASE_RE')

  assert('http://test.com/??seajs/seajs/2.1.0/sea.js,jquery/jquery/1.9.2/jquery.js'.match(BASE_RE)[1] === 'http://test.com/', 'BASE_RE')
  assert('http://test.com/seajs/??seajs/2.1.0/sea.js,seajs-combo/1.0.0/seajs-combo.js'.match(BASE_RE)[1] === 'http://test.com/', 'BASE_RE')
  assert('http://test.com/libs/??seajs/seajs/2.1.0/sea.js,jquery/jquery/1.9.2/jquery.js'.match(BASE_RE)[1] === 'http://test.com/libs/', 'BASE_RE')



  test.next()

});

