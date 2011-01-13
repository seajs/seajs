S.declare(['submodule/a', 'b'], function(require, exports) {

exports.foo = function () {
    return require('b');
};

});
