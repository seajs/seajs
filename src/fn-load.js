
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


  /**
   * Loads preload modules before callback.
   * @param {function()} callback The callback function.
   */
  fn.preload = function(callback) {
    var preloadMods = config.preload;
    var len = preloadMods.length;

    if (len) {
      config.preload = preloadMods.slice(len);
      fn.load(preloadMods, function() {
        fn.preload(callback);
      });
    }
    else {
      callback();
    }
  };


  /**
   * Loads modules to the environment.
   * @param {Array.<string>} ids An array composed of module id.
   * @param {function(*)=} callback The callback function.
   * @param {Object=} context The context of current executing environment.
   */
  fn.load = function(ids, callback, context) {
    if (util.isString(ids)) {
      ids = [ids];
    }
    var uris = fn.Require.prototype._batchResolve(ids, context);

    provide(uris, function() {
      fn.preload(function() {
        var require = fn.createRequire(context);

        var args = util.map(uris, function(uri) {
          return require(data.memoizedMods[uri]);
        });

        if (callback) {
          callback.apply(null, args);
        }
      });
    });
  };


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
          var deps = (memoizedMods[uri] || 0).dependencies || [];
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
          if (--remain === 0) onProvide();
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

      fetchingMods[uri] = util.getAsset(
          uri,
          cb,
          data.config.charset
          );

      data.pendingModIE = null;
    }

    function cb() {

      if (data.pendingMods) {
        util.forEach(data.pendingMods, function(pendingMod) {
          util.memoize(pendingMod.id, uri, pendingMod);
        });

        data.pendingMods = [];
      }

      if (fetchingMods[uri]) {
        delete fetchingMods[uri];
      }

      if (callback) {
        callback();
      }
    }
  }

})(seajs._util, seajs._data, seajs._fn);
