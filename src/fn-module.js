
/**
 * @fileoverview Module Constructor.
 */

(function(fn) {

  /**
   * Module constructor.
   * @constructor
   * @param {string=} opt_id The module id.
   * @param {Array.<string>|string=} opt_deps The module dependencies.
   * @param {function()|Object} factory The module factory function.
   */
  fn.Module = function(opt_id, opt_deps, factory) {

    this.id = opt_id;
    this.dependencies = opt_deps || [];
    this.factory = factory;

  };

})(seajs._fn);
