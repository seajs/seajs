/**
 * Display warning messages in console according to your rules.
 */
define('{seajs}/plugin-warning', [], function() {

  var pluginSDK = seajs.pluginSDK
  var Module = pluginSDK.Module


  // Hack _save method
  var _save = Module._save
  Module._save = function(uri, meta) {
    checkMultiVersion(uri)
    _save(uri, meta)
  }


  var uriCache = {}
  var RE_VERSION = /(?:\d+\.)+\d+/

  // Only support this version style: `zz/1.2.3/xx` or `zz/xx-1.2.3.js`
  function checkMultiVersion(uri) {
    if (!RE_VERSION.test(uri)) return

    var key = uri.replace(RE_VERSION, '{{version}}')
    var versions = uriCache[key] || (uriCache[key] = [])
    versions.push(uri)

    if (versions.length > 1) {
      seajs.log('WARNING: This module has multiple versions:\n' +
          versions.join('\n'), 'warn')
    }
  }

})

// Runs it immediately
seajs.use('{seajs}/plugin-warning');

