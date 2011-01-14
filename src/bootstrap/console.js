
/**
 * @fileoverview Provides console module to environment.
 * @author lifesinger@gmail.com (Frank Wang)
 */

(function(console) {

  module.declare('console', [], function(require, exports) {

    /**
     * @define {boolean} DEBUG is provided as a convenience so that debugging
     * code that should not be included in a production js_binary can be easily
     * stripped by specifying --define exports.DEBUG=false to the JSCompiler.
     */
    exports['DEBUG'] = true;


    var cats = ['log', 'info', 'warn', 'error'], cat, i = 0;
    while ((cat = cats[i++])) {
      /**
       * Prints debug info. NOTICE: 'console.log/info/etc(args)' lines will be
       * automatically stripped from compressed files when building.
       */
      exports[cat] = factory(cat);
    }

    function factory(cat) {
      return function() {
        if (exports['DEBUG'] && console && console[cat]) {
          console[cat](Array.prototype.join.call(arguments, ' '));
        }
      }
    }

  });

})(this['console']);
