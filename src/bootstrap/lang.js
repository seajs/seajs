
/**
 * @fileoverview Language enhancement.
 * @author lifesinger@gmail.com (Frank Wang)
 */

(function(_) {

  module.declare('lang', [], function(require, exports) {

    /**
     * Copies all the members of a source object to a target object.
     * @param {Object} target Target.
     * @param {Object} source Source.
     * @return {Object} Target.
     */
    exports.mix = function(target, source) {
      for (var x in source) {
        if (source.hasOwnProperty(x)) {
          target[x] = source[x];
        }
      }
      return target;
    };


    // Mixes in existed members in _.
    exports.mix(exports, _);

  });

})(module._);

// Makes module pure.
delete module._;
