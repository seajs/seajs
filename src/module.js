/**
 * The Module constructor and its methods
 */
;(function(seajs, util) {

  var cachedModules = {}
  var currentPackegeModules = []

  var STATUS = {
    'FETCHED': 0,  // The module file has been downloaded to the browser.
    'SAVED': 1,    // The module info including uri has been saved.
    'LOADED': 2,   // All dependencies are loaded.
    'COMPILED': 3  // The module.exports is available.
  }

  var fetchingList = {}
  var fetchedList = {}
  var callbackList = {}


  /**
   * The Module constructor
   */
  function Module(id, deps, factory, parent) {
    this.id = id
    this.dependencies = deps || []
    this.factory = factory
    this.parent = parent
    this.status = 0
  }


  Module.prototype._use = function(ids, callback) {
    util.isString(ids) && (ids = [ids])
    var uris = resolve(ids, this.uri)

    this._load(uris, function() {
      var args = util.map(uris, function(uri) {
        return cachedModules[uri]._compile()
      })

      if (callback) {
        callback.apply(null, args)
      }
    })
  }


  Module.prototype._load = function(uris, callback) {

    // Removes already loaded modules.
    var unLoadedUris = util.filter(uris, function(uri) {
      return !cachedModules[uri] ||
          cachedModules[uri].status < STATUS.LOADED;
    });

    if (unLoadedUris.length === 0) {
      callback();
      return;
    }

    for (var i = 0, n = unLoadedUris.length, remain = n; i < n; i++) {
      (function(uri) {

        if (cachedModules[uri]) {
          onLoad();
        } else {
          fetch(uri, onLoad);
        }

        function onLoad() {
          var module = cachedModules[uri];

          if (module) {
            var deps = module.dependencies;
            var m = deps.length;

            if (m) {
              // if a -> [b -> [c -> [a, e], d]]
              // when use(['a', 'b'])
              // should remove a from c.deps
              deps = removeCyclicWaitingUris(uri, deps);
              m = deps.length;
            }

            if (m) {
              remain += m;
              provide(deps, function() {
                remain -= m;
                if (remain === 0) onProvide();
              });
            }
          }

          if (--remain === 0) onProvide();
        }

      })(unLoadedUris[i]);
    }

    function onProvide() {
      util.forEach(unLoadedUris, function(uri) {
        cachedModules[uri].status = STATUS.LOADED;
      });

      callback();
    }
  };


  Module.prototype._compile = function() {
    var module = this;

    module.status = STATUS.COMPILED;
  };


  Module._save = function(uri, module) {
    // Don't override existed module.
    if (!cachedModules[uri]) {
      module.uri = uri;
      module.dependencies = resolve(module.dependencies, uri);
      module.status = STATUS.SAVED;
      cachedModules[uri] = module;
    }
  };


  function resolve(ids, refUri) {
    if (util.isString(ids)) {
      return util.id2Uri(ids, refUri);
    }

    return util.map(ids, function(id) {
      return resolve(id, refUri);
    });
  }


  function fetch(uri, callback) {
    var srcUrl = util.parseMap(uri);

    if (fetchedList[srcUrl]) {
      callback();
      return;
    }

    if (fetchingList[srcUrl]) {
      callbackList[srcUrl].push(callback);
      return;
    }

    fetchingList[srcUrl] = true;
    callbackList[srcUrl] = [callback];

    RP.load(
        srcUrl,

        function() {
          fetchedList[srcUrl] = true;

          // Memoize anonymous module
          var mod = data.anonymousMod;
          if (mod) {
            memoize(uri, mod);
            data.anonymousMod = null;
          }

          // Assign the first module in package to memoizeMos[uri]
          // See: test/issues/un-correspondence
          mod = data.packageMods[0];
          if (mod && !memoizedMods[uri]) {
            memoizedMods[uri] = mod;
          }
          data.packageMods = [];

          // Clear
          if (fetchingList[srcUrl]) {
            delete fetchingList[srcUrl];
          }

          // Call callbackList
          if (callbackList[srcUrl]) {
            util.forEach(callbackList[srcUrl], function(fn) {
              fn();
            });
            delete callbackList[srcUrl];
          }

        },

        config.charset
    );
  }


  /**
   * if a -> [b -> [c -> [a, e], d]]
   * call removeMemoizedCyclicUris(c, [a, e])
   * return [e]
   */
  function removeCyclicWaitingUris(uri, deps) {
    return util.filter(deps, function(dep) {
      return !isCyclicWaiting(memoizedMods[dep], uri);
    });
  }

  function isCyclicWaiting(mod, uri) {
    if (!mod || mod.ready) return false;

    var deps = mod.dependencies || [];
    if (deps.length) {
      if (util.indexOf(deps, uri) > -1) {
        return true;
      }
      else {
        for (var i = 0; i < deps.length; i++) {
          if (isCyclicWaiting(memoizedMods[deps[i]], uri)) {
            return true;
          }
        }
        return false;
      }
    }

    return false;
  }


  Module.save = save;
  seajs.Module = Module;
  seajs.globalModule = new Module(util.pageUrl);

})(seajs, seajs.util);
