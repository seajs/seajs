/**
 * The storage plugin
 */
define('seajs/plugin-storage', ['./plugin-base','store','manifest'], function(require) {

  var plugin = require('./plugin-base'),
      manifest = require('manifest'),
      util = plugin.util,
      store = require('store'),
      s = store.createStorage('localStorage'),
      _manifest = s.get('manifest'),
      isNeedUpdate = false,
      updateList = {}

  // need update only when  _manifest does not exist or local manifest.version not equals online manifest.version 
  isNeedUpdate = !_manifest || _manifest.version !== manifest.version 

  if(isNeedUpdate){
    // if local manifest does not exist  update all entries which are listed in manifest file
    if(!_manifest){
      updateList = manifest
    }else{
      for(var i in manifest){
        if(i != 'version'){

          // Update a entry when the entry does not exist in the manifest file or local entry.version not equals online entry.version 
          
          !_manifest[i] && (updateList[i] = manifest[i])

          _manifest[i] && _manifest[i].version != manifest[i].version && (updateList[i] = manifest[i])
        }

      }
    }
    _manifest = manifest
    s.set('manifest',manifest)
  }


  extendResolve()


  plugin.add({
    name: 'storage',

    ext: ['.js'],

    fetch: function(url, callback) {

      var stCache = s.get(url),
          realPath= util.toRealPath(url,_manifest)
      // use localStorage only when the entry has existed in localStorage and the entry is listed in manifest file meanwhile not be listed in updateList
      if(stCache  && _manifest[url] && !updateList[url]){
        util.globalEval(stCache)
        callback()
      }else{

        util.xhr(realPath, function(code) {
          parseInt(seajs.pluginSDK.config.debug) == 2 || ( _manifest[url] && s.set(url,code) )
          util.globalEval(code)
          callback()
        })
      }

    }
  })


  var Module = seajs.pluginSDK.Module
  
  // fix refUri
  function extendResolve() {
    var _resolve = Module._resolve

    Module._resolve = function(id, refUri) {
      var manifest = Module._find('manifest')

      manifest && (refUri = toRealPath(refUri, manifest))
      return _resolve(id, refUri)
    }
  }

  // manifest file maybe declare the entry's version ,we need to make up the real path
  function toRealPath(url, manifest) {
    if (!manifest[url]) return url

    var m = url.match(/^(.*)\/(.*)$/)
    var dirname = m[1]
    var name = m[2]

    var version = manifest[url]['version']
    if (!version) return url

    return dirname + '/' + version + '/' + name
  }

});
