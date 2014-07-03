define('g', ['./h', './i'], function(require) {
  var h = require('./h');
  var i = require('./i');

  var test = require('../test');
  test.assert(h.h === 'h', 'h.h should be h');
  test.assert(h.h2 === 'h2', 'h.h2 should be h2');
  test.assert(i === 'i', 'i should be i');

  return 'g';
})