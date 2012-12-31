
// 配置别名和预加载项
seajs.config({
  alias: {
    'jquery': './jquery.js',
    'cookie': './jquery.cookie.js'
  },
  preload: ['jquery']
})


// 将 jQuery 暴露到全局
seajs.modify('jquery', function(require, exports) {
  window.jQuery = window.$ = exports
})


// 将 jQuery Cookie 插件自动包装成 CMD 接口
seajs.modify('cookie', function(require, exports, module) {
  module.exports = $.cookie
})


// 调用主模块
seajs.use('./main')