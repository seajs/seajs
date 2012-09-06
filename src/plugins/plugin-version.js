/**
 * The storage plugin
 */
define('seajs/plugin-storage', ['./plugin-base', 'store', 'manifest'], function(require) {

  var latestManifest = require('manifest')
  if (!latestManifest) return

  var plugin = require('./plugin-base')
  var util = plugin.util
  var store = require('store').createStorage('localStorage')

  var storedManifest = store.get('manifest')
  var updatedList = {}


  var isNeedUpdate = !storedManifest ||
      storedManifest.apiVersion !== latestManifest.apiVersion

  if (isNeedUpdate) {
    updatedList = getUpdatedList()

    // Update manifest in localStorage to the latest version
    storedManifest = latestManifest
    store.set('manifest', storedManifest)
  }


  // Hack Module._resolve method
  extendResolve()


  // Register plugin information
  plugin.add({
    name: 'version',

    ext: ['.js'],

    fetch: function(url, callback) {
      var cachedCode = store.get(url)

      if (cachedCode && storedManifest[url] && !updatedList[url]) {
        util.globalEval(cachedCode)
        callback()
      }
      else {
        var realPath = getRealPath(url, storedManifest)

        util.xhr(realPath, function(code) {
          parseInt(seajs.pluginSDK.config.debug) == 2 || ( storedManifest[url] && store.set(url, code) )
          util.globalEval(code)
          callback()
        })
      }

    }
  })


  // Helpers
  // -------

  function getUpdatedList() {
    if (!storedManifest) {
      return latestManifest
    }

    var list = {}

    for (var key in latestManifest) {
      if (!latestManifest.hasOwnProperty(key) || key === 'apiVersion') continue

      var storedVersion = storedManifest[key]
      var latestVersion = latestManifest[key]

      if (storedVersion !== latestVersion) {
        list[key] = latestVersion
      }
    }

    return list
  }


  var Module = seajs.pluginSDK.Module

  function extendResolve() {
    var _resolve = Module._resolve
    Module._resolve = function(id, refUri) {
      return getRealPath(_resolve(id, refUri), storedManifest)
    }
  }


  function getRealPath(url, manifest) {
    var apiVersion
    if (!manifest[url] || !(apiVersion = manifest[url]['apiVersion'])) {
      return url
    }

    var m = url.match(/^(.*)\/([^\/]+)$/)
    if (!m) return url

    var dirname = m[1]
    var name = m[2]
    return dirname + '/' + apiVersion + '/' + name
  }

});


// Runs it immediately
seajs.use('seajs/plugin-version');

