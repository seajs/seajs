
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
   * @param {Array.<string>} ids An array composed of module id.
   * @param {function(*)=} callback The callback function.
   * @param {boolean=} noRequire For inner use.
   */
  function provide(ids, callback, noRequire) {
    var that = this;
    var originalUris = util.ids2Uris(ids, that.uri);
    var uris = util.getUnMemoized(originalUris);

    if (uris.length === 0) {
      return cb();
    }

    for (var i = 0, n = uris.length, remain = n; i < n; i++) {
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

      })(uris[i]);
    }

    function cb() {
      if (callback) {
        var require;

        if (!noRequire) {
          require = fn.createRequire({
            uri: that.uri,
            deps: originalUris
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
      util.scriptOnload(fetchingMods[uri], cb);
    }
    else {
      // See fn-define.js: "uri = data.pendingModIE"
      data.pendingModIE = uri;

      fetchingMods[uri] = util.getScript(
          util.restoreUrlArgs(uri),
          cb,
          data.config.charset
          );

      data.pendingModIE = null;
    }

    function cb() {
      if (data.pendingMod) {
        util.memoize(uri, data.pendingMod);
        data.pendingMod = null;
      }

      if (fetchingMods[uri]) {
        delete fetchingMods[uri];
      }

      if (callback) {
        callback();
      }
    }
  }

})(seajs._util, seajs._data, seajs._fn, this);
