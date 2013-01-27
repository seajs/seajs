
// 配置别名和预加载项
seajs.config({
  alias: {
    'jquery': './jquery.js',
    'cookie': './jquery.cookie.js'
  },
  preload: ['jquery']
})


// 将 jQuery 暴露到全局
seajs.on('compiled', function(mod) {
  if (mod.uri.indexOf('jquery.js') > -1) {
    window.jQuery = window.$ = mod.exports
  }
})


// 将 jQuery Cookie 插件自动包装成 CMD 接口
seajs.on('compile', function(mod) {
  if (mod.uri.indexOf('cookie.js') > -1) {
    mod.exports = $.cookie
  }
})


// 调用主模块
seajs.use('./main')
