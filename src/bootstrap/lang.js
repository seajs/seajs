
/**
 * @fileoverview Language enhancement.
 * @author lifesinger@gmail.com (Frank Wang)
 */

(function(_) {

  module.declare('lang', [], function(require, exports) {

    // Mixes in existed members in _
    _.mix(exports, _);

  });

})(module['_']);

// pure
delete module['_'];
