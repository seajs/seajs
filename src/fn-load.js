
/**
 * @fileoverview Loads a module and gets it ready to be require()d.
 */

(function(util, data, fn, global) {

  /**
   * Modules that are being downloaded.
   * { uri: scriptNode, ... }
   */
  var fetchingMods = {};

  var memoizedMods = data.memoizedMods;


  /**
   * Loads modules to the environment.
   * @param {Array.<string>} ids An array composed of module id.
   * @param {function(*)=} callback The callback function.
   */
  fn.load = function(ids, callback) {
    if (util.isString(ids)) {
      ids = [ids];
    }

    // normalize
    var uris = util.ids2Uris(ids, this.uri);

    // 'this' may be seajs or module, due to seajs.boot() or module.load().
    provide.call(this, uris, function(require) {
      var args = util.map(uris, function(uri) {
        return require(uri);
      });

      if (callback) {
        callback.apply(global, args);
      }
    });

    return this;
  };


  /**
   * Provides modules to the environment.
   * @param {Array.<string>} uris An array composed of module uri.
   * @param {function(*)=} callback The callback function.
   * @param {boolean=} noRequire For inner use.
   */
  function provide(uris, callback, noRequire) {
    var that = this;
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
            }, true);
          }
          if (--remain === 0) onProvide();
        }

      })(unReadyUris[i]);
    }

    function onProvide() {
      util.setReadyState(unReadyUris);

      if (callback) {
        var require;

        if (!noRequire) {
          require = fn.createRequire({
            uri: that.uri
          });
        }

        callback(require);
      }
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
          getUrl(uri),
          cb,
          data.config.charset
          );

      data.pendingModIE = null;
    }

    function cb() {

      if (data.pendingMods) {
        util.each(data.pendingMods, function(pendingMod) {
          util.memoize(pendingMod.id, uri, pendingMod);
        });

        data.pendingMods = [];
      }

      if (fetchingMods[uri]) {
        delete fetchingMods[uri];
      }

      if (!memoizedMods[uri]) {
        util.error({
          message: 'can not memoized',
          from: 'load',
          uri: uri,
          type: 'warn'
        });
      }

      if (callback) {
        callback();
      }
    }
  }


  var timestamp = util.now();

  function getUrl(uri) {
    var url = util.restoreUrlArgs(uri);

    // When debug is 2, a unique timestamp will be added to each URL.
    // This can be useful during testing to prevent the browser from
    // using a cached version of the file.
    if (data.config.debug == 2) {
      url += (url.indexOf('?') === -1 ? '?' : '') +
          'seajs-timestamp=' + timestamp;
    }

    return url;
  }

})(seajs._util, seajs._data, seajs._fn, this);
