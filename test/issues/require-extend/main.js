define(function(require) {
  var test = require('../../test');


  // before
  var r = require.resolve('./a.coffee');
  test.assert(/\.js$/.test(r), r);

  // run extend
  require('./extend');

  // after
  r = require.resolve('./a.coffee');
  test.assert(/\.coffee$/.test(r), r);


  require.async('./b', function(a) {
    test.assert(a.name === 'a', 'a.coffee is ok');
    test.done();
  });

});
