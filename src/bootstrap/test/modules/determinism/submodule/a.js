module.declare(['test', 'a'], function (require) {

  var test = require('test');

  var pass = false;
  try {
    require('a');
  } catch (x) {
    pass = true;
  }

  test.assert(pass, 'require() does not fall back to relative modules when absolutes are not available.')

});
