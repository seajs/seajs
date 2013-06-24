define(function(require) {

  var test = require('../../test')
  var assert = test.assert


  // var BASE_RE = /^(.+?\/)(\?\?)?(seajs\/)+/

  assert(BASE_RE.match('http://test.com/seajs/sea.js')[1] === 'http://test.com/', 'BASE_RE')
  assert(BASE_RE.match('http://test.com/seajs/2.1.0/sea.js')[1] === 'http://test.com/', 'BASE_RE')
  assert(BASE_RE.match('http://test.com/seajs/seajs/2.1.0/sea.js')[1] === 'http://test.com/', 'BASE_RE')

  assert(BASE_RE.match('http://test.com/??seajs/seajs/2.1.0/sea.js,jquery/jquery/1.9.2/jquery.js')[1] === 'http://test.com/', 'BASE_RE')
  assert(BASE_RE.match('http://test.com/seajs/??seajs/2.1.0/sea.js,seajs-combo/1.0.0/seajs-combo.js')[1] === 'http://test.com/', 'BASE_RE')
  assert(BASE_RE.match('http://test.com/libs/??seajs/seajs/2.1.0/sea.js,jquery/jquery/1.9.2/jquery.js')[1] === 'http://test.com/libs/', 'BASE_RE')



  test.next()

});

