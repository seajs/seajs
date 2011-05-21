
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
    ids = util.ids2Uris(ids, this.uri);

    // 'this' may be seajs or module, due to seajs.boot() or module.load().
    provide.call(this, ids, function(require) {
      var args = [];

      for (var i = 0; i < ids.length; i++) {
        args[i] = require(ids[i]);
      }

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
    var _uris = util.getUnMemoized(uris);

    if (_uris.length === 0) {
      return cb();
    }

    for (var i = 0, n = _uris.length, remain = n; i < n; i++) {
      (function(uri) {

        fetch(uri, function() {
          var deps = (memoizedMods[uri] || 0).dependencies || [];
          var m = deps.length;

          if (m) {
            remain += m;

            provide(deps, function() {
              remain -= m;
              if (remain === 0) cb();
            }, true);
          }

          if (--remain === 0) cb();
        });

      })(_uris[i]);
    }

    function cb() {
      if (callback) {
        var require;

        if (!noRequire) {
          require = fn.createRequire({
            uri: that.uri,
            deps: uris
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

        for (var i = 0; i < data.pendingMods.length; i++) {
          var pendingMod = data.pendingMods[i];
          util.memoize(pendingMod.id, uri, pendingMod);
        }

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
