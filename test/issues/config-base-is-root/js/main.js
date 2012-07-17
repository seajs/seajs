define(function(require) {

  var test = require('../../../test');

  seajs.config({
    base: '/root-path/'
  });

  function expectedPath(str) {
    return location.protocol + '//' + location.host + '/root-path/' + str + '.js'
  }

  test.assert(
      require.resolve('z') === expectedPath('z'),
      'expected path is ' + expectedPath('z') + ', but was ' +  require.resolve('z')
  );

  test.done();

});
