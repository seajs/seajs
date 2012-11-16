define(function(require, exports, module) {

  function Developer() {}

  module.extend(Developer, require('./stuff'));

  module.exports = Developer;

});
