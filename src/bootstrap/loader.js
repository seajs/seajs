
/**
 * @fileoverview SeaJS Module Loader.
 * @author lifesinger@gmail.com (Frank Wang)
 */

(function() {

  var noop = function() {
  };

  var loader = S.ModuleLoader = {
    baseUrl: '',
    importModule: noop,
    importingModule: null,
    main: null
  };

  /**
   * @constructor
   */
  loader.Module = function(id, uri) {
    this.id = id;
    this.uri = uri || getURI(id);

    this.require = noop;
    this.exports = {};
  };

  function getURI(id) {
    return loader.baseUrl + id + '.js';
  }

  S.declare = function(factory) {
    var module = loader.importingModule;
    module.factory = factory;
    factory.call(module, module.require, module.exports, module);
  };

})();
