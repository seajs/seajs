define(function(require) {
  require('./a')
  global.module_singleton_stack.push('init b')
});
