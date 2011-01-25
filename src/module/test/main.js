(function() {

  var dir = decodeURIComponent((location.search || '?').substring(1));
  var program = './' + dir + '/program';

  module.declare([program, './test'], function(require, exports, module) {

    require(program);
    require('./test').next();

  });

})();
