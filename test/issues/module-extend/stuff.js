define(function(require, exports, module) {

  function Stuff() {}

  module.extend(Stuff, require('./person'));

  module.exports = Stuff;

});
