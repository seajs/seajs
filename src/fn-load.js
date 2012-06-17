
/**
 * @fileoverview Loads a module and gets it ready to be require()d.
 */

(function(util, data, fn) {

  var memoizedMods = data.memoizedMods;
  var config = data.config;
  var RP = fn.Require.prototype;


  // Module status:
  //  1. downloaded - The script file has been downloaded to the browser.
  //  2. define()d - The define() has been executed.
  //  3. memoize()d - The module info has been added to memoizedMods.
  //  4. require()d -  The module.exports is available.


  /**
   * Loads preload modules before callback.
   * @param {function()} callback The callback function.
   */
  function preload(callback) {
    var preloadMods = config.preload;

    if (preloadMods.length) {
      load(preloadMods, function() {
        config.preload = [];
        callback();
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
        }

      })(unReadyUris[i]);
    }

    function onProvide() {
      setReadyState(unReadyUris);
      callback();
    }
  }


  var fetchingList = {};
  var fetchedList = {};
  var callbackList = {};

  /**
   * Fetches a module file.
   * @param {string} uri The module uri.
   * @param {function()} callback The callback function.
   */
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


  // Helpers

  /**
   * Caches mod info to memoizedMods.
   */
  function memoize(uri, mod) {
    // Don't override existed module.
    if (!memoizedMods[uri]) {
      mod.id = uri; // change id to the absolute path.
      memoizedMods[uri] = mod;
    }
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


  fn.memoize = memoize;
  fn.preload = preload;
  fn.load = load;

})(seajs._util, seajs._data, seajs._fn);
