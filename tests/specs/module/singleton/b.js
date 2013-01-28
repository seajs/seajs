define(function(require) {
  require('./a')
  module_singleton_stack.push('init b')
});
