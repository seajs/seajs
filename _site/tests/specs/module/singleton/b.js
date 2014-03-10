define(function(require) {
  //console.log('a.status = ' + seajs.cache[require.resolve('./a')].status)

  require('./a')
  global.module_singleton_stack.push('init b')
});
