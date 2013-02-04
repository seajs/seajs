define(function(require) {

  var test = require('../../test')
  var assert = test.assert


  assert(unique(['a', 'b', 'a']).join() === 'a,b', 'unique')
  assert(unique(['a', 'b', 'c']).join() === 'a,b,c', 'unique')

  assert(unique(['a', 'b', 'toString']).join() ===
      'a,b,toString', 'unique')

  assert(unique(['a', 'hasOwnProperty', 'toString']).join() ===
      'a,hasOwnProperty,toString', 'unique')

  assert(unique(['prototype', 'hasOwnProperty', 'toString']).join() ===
      'prototype,hasOwnProperty,toString', 'unique')


  test.next()

});

