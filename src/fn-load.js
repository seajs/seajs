
/**
 * @fileoverview Loads a module and gets it ready to be require()d.
 */

(function(util, data, fn) {

  /**
   * Modules that are being downloaded.
   * { uri: scriptNode, ... }
   */
  var fetchingMods = {};

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
      var uris = RP._batchResolve(ids, context);

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
    var unReadyUris = util.getUnReadyUris(uris);

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
                deps = mod.dependencies = RP._batchResolve(deps, {
                  uri: mod.id
                });
              }

              var m = deps.length;

              if (m) {
                // if a -> [b -> [c -> [a, e], d]]
                // when use(['a', 'b'])
                // should remove a from c.deps
                deps = util.removeCyclicWaitingUris(uri, deps);
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
      util.setReadyState(unReadyUris);
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
      util.assetOnload(fetchingMods[uri], cb);
    }
    else {
      // See fn-define.js: "uri = data.pendingModIE"
      data.pendingModIE = uri;

      fetchingMods[uri] = RP.load(
          uri,
          cb,
          data.config.charset
          );

      data.pendingModIE = null;
    }

    function cb() {
      var pendingMods = data.pendingMods;

      if (pendingMods.length) {
        util.forEach(pendingMods, function(pendingMod) {
          util.memoize(pendingMod.id, uri, pendingMod);
        });
        data.pendingMods = [];
      }

      if (fetchingMods[uri]) {
        delete fetchingMods[uri];
      }
      callback();
    }
  }


  fn.load = load;

})(seajs._util, seajs._data, seajs._fn);
