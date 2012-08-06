/**
 * The i18n plugin for multi language support
 */
define('seajs/plugin-i18n', [], function() {

  var pluginSDK = seajs.pluginSDK
  var Module = pluginSDK.Module

  var locale = pluginSDK.config.locale || ''
  var _resolve = Module._resolve


  Module._resolve = function(id, refUri) {

    if (id.indexOf('i18n!') === 0) {
      id = './i18n/' + locale + '/' + id.substring(5)
    }

    return _resolve(id, refUri)
  }

})

// Runs it immediately
seajs.use('seajs/plugin-i18n');
