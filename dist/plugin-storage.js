/**
 * The storage plugin
 */
define('seajs/plugin-storage', ['./plugin-base','store','manifest'], function(require, exports) {

  var plugin = require('./plugin-base'),
      manifest = require('manifest'),
      util = plugin.util,
      store = require('store'),
      s = store.createStorage('localStorage'),
      _manifest = s.get('manifest'),
      isNeedUpdate = false,
      updateList = {}


  if(!_manifest){
    isNeedUpdate = true
  }

  isNeedUpdate || _manifest.version == manifest.version ? isNeedUpdate : isNeedUpdate = true
  

  if(isNeedUpdate){
    if(!_manifest){
      updateList = manifest
    }else{
      for(var i in manifest){
        if(i != 'version'){

          !_manifest[i] && (updateList[i] = manifest[i]) 

          _manifest[i] && _manifest[i].version != manifest[i].version && (updateList[i] = manifest[i]) 
        }
      
      }
    }
    _manifest = manifest    
    s.set('manifest',manifest)
  } 

  plugin.add({
    name: 'storage',

    ext: ['.js'],

    fetch: function(url, callback) {

      var stCache = s.get(url),
          realPath= util.toRealPath(url,_manifest)

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

});

