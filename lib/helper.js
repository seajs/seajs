/**
 * Custom require for sea-node.js
 * @author lifesinger@gmail.com
 */


/**
 * Creates a new `require` related to the specified module.
 */
exports.createRequire = function(module) {

  function req(id) {
    id = id.replace(/\?.*/, ''); // remove timestamp etc.
    id = parseAlias(id);
    id = resolveFilename(id, module);
    return require(id);
  }

  req.async = function(ids, callback) {
    if (typeof ids === 'string') ids = [ids];
    callback = callback || noop;

    var args = ids.map(function(id) {
      return req(id); // Only support local filesystem path.
    });

    callback.apply(null, args);
  };

  return req;
};


var aliasCache = {};

global.seajs = {

  config: function(o) {
    if (o && o.alias) {
      var alias = o.alias;

      for (var p in alias) {
        if (alias.hasOwnProperty(p)) {

          if (aliasCache.hasOwnProperty(p)) {
            if (aliasCache[p] !== alias[p]) {
              throw 'Alias is conflicted:' + p;
            }
          }
          else {
            aliasCache[p] = alias[p];
          }
        }
      }
    }
  }
};

function parseAlias(id) {
  // #xxx means xxx is parsed.
  if (id.charAt(0) === '#') {
    return id.substring(1);
  }

  // Only top-level id needs to parse alias.
  if (isTopLevel(id)) {
    var parts = id.split('/');
    var first = parts[0];

    if (aliasCache.hasOwnProperty(first)) {
      parts[0] = aliasCache[first];
      id = parts.join('/');
    }
  }

  return id;
}


var Module = require('module');

function resolveFilename(id, contextModule) {
  return isRelative(id) ?
      Module['_resolveFilename'](id, contextModule) :
      id;
}

function isTopLevel(id) {
  var c = id.charAt(0);
  return id.indexOf('://') === -1 && c !== '.' && c !== '/';
}

function isRelative(id) {
  return id.indexOf('./') === 0 || id.indexOf('../') === 0;
}


function noop() {
}
