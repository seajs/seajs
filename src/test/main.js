(function() {

  var dir = decodeURIComponent((location.search || '?').substring(1));
  var program = './' + dir + '/program';

  module.declare([program, './test'], function(require) {

    require(program);
    require('./test').next();

  });
})();
