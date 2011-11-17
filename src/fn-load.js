
/**
 * @fileoverview Loads a module and gets it ready to be require()d.
 */

(function(util, data, fn) {

  /**
   * Modules that are being downloaded.
   * { uri: scriptNode, ... }
   */
  var fetchingMods = {};
  var callbackList = {};

  var memoizedMods = data.memoizedMods;
  var config = data.config;
  var RP = fn.Require.prototype;



  /**
   * Loads preload modules before callback.
   * @param {function()} callback The callback function.
   */
  function preload(callback) {
    var preloadMods = config.preload;
    var len = preloadMods.length;

    if (len) {
      config.preload = preloadMods.slice(len);
      load(preloadMods, function() {
        preload(callback);
      });
    }
    else {
      callback();
    }
  }


  /**
   * Loads modules to the environment.
   * @param {Array.<string>} ids An array composed of module id.
   * @param {function(*)=} callback The callback function.
   * @param {Object=} context The context of current executing environment.
   */
  function load(ids, callback, context) {
    preload(function() {
      if (util.isString(ids)) {
        ids = [ids];
      }
      var uris = RP.resolve(ids, context);

      provide(uris, function() {
        var require = fn.createRequire(context);

        var args = util.map(uris, function(uri) {
          return require(data.memoizedMods[uri]);
        });

        if (callback) {
          callback.apply(null, args);
        }
      });
    });
  }


  /**
   * Provides modules to the environment.
   * @param {Array.<string>} uris An array composed of module uri.
   * @param {function()=} callback The callback function.
   */
  function provide(uris, callback) {
    var unReadyUris = getUnReadyUris(uris);

    if (unReadyUris.length === 0) {
      return onProvide();
    }

    for (var i = 0, n = unReadyUris.length, remain = n; i < n; i++) {
      (function(uri) {

        if (memoizedMods[uri]) {
          onLoad();
        } else {
          fetch(uri, onLoad);
        }

        function onLoad() {
          // Preload here to make sure that:
          // 1. RP.resolve etc. modified by some preload plugins can be used
          //    immediately in the id resolving logic.
          //    Ref: issues/plugin-coffee
          // 2. The functions provided by the preload modules can be used
          //    immediately in factories of the following modules.
          preload(function() {
            var mod = memoizedMods[uri];

            if (mod) {
              var deps = mod.dependencies;

              if (deps.length) {
                // Converts deps to absolute id.
                deps = mod.dependencies = RP.resolve(deps, {
                  uri: mod.id
                });
              }

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
          });
        }

      })(unReadyUris[i]);
    }

    function onProvide() {
      setReadyState(unReadyUris);
      callback();
    }
  }


  /**
   * Fetches a module file.
   * @param {string} uri The module uri.
   * @param {function()} callback The callback function.
   */
  function fetch(uri, callback) {

    if (fetchingMods[uri]) {
      callbackList[uri].push(callback);
      return;
    }

    callbackList[uri] = [callback];
    fetchingMods[uri] = true;

    RP.load(
        util.parseMap(uri),

        function() {

          // Memoize anonymous module
          var mod = data.anonymousMod;
          if (mod) {
            // Don't override existed module
            if (!memoizedMods[uri]) {
              memoize(uri, mod);
            }
            data.anonymousMod = null;
          }

          // Clear
          if (fetchingMods[uri]) {
            delete fetchingMods[uri];
          }

          // Call callbackList
          if (callbackList[uri]) {
            util.forEach(callbackList[uri], function(fn) {
              fn();
            });
            delete callbackList[uri];
          }

        },

        data.config.charset
    );
  }


  // Helpers

  /**
   * Caches mod info to memoizedMods.
   */
  function memoize(uri, mod) {
    mod.id = uri; // change id to the absolute path.
    memoizedMods[uri] = mod;
  }

  /**
   * Set mod.ready to true when all the requires of the module is loaded.
   */
  function setReadyState(uris) {
    util.forEach(uris, function(uri) {
      if (memoizedMods[uri]) {
        memoizedMods[uri].ready = true;
      }
    });
  }

  /**
   * Removes the "ready = true" uris from input.
   */
  function getUnReadyUris(uris) {
    return util.filter(uris, function(uri) {
      var mod = memoizedMods[uri];
      return !mod || !mod.ready;
    });
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
    if (!mod || mod.ready) {
      return false;
    }

    var deps = mod.dependencies || [];
    if (deps.length) {
      if (~util.indexOf(deps, uri)) {
        return true;
      } else {
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


  // Public API

  util.memoize = memoize;
  fn.load = load;

})(seajs._util, seajs._data, seajs._fn);
