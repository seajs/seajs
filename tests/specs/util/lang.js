define(function(require) {

  var test = require('../../test')
  var assert = test.assert

  // IE has DONT ENUM bug
  var oldIE = !!this.attachEvent


  assert(unique(['a', 'b', 'a']).join() === 'a,b', 'unique')
  assert(unique(['a', 'b', 'c']).join() === 'a,b,c', 'unique')

  assert(unique(['a', 'b', 'toString']).join() ===
      oldIE ? 'a,b' : 'a,b,toString', 'unique')

  assert(unique(['a', 'hasOwnProperty', 'toString']).join() ===
      oldIE ? 'a' : 'a,hasOwnProperty,toString', 'unique')

  assert(unique(['prototype', 'hasOwnProperty', 'toString']).join() ===
      oldIE ? '' : 'prototype,hasOwnProperty,toString', 'unique')

  test.next()

});

