/**
 * Helpers for sea-node.js
 * @author lifesinger@gmail.com
 */

exports.configFn = function(o) {
  if (o && o.alias) {
    var alias = o.alias

    for (var p in alias) {
      if (alias.hasOwnProperty(p)) {
        aliasCache[p] = alias[p]
      }
    }

  }
}


exports.createRequire = function(module) {

  function req(id) {
    id = id.replace(/\?.*$/, '') // remove timestamp
    id = parseAlias(id)
    id = resolveFilename(id, module)
    return require(id)
  }

  req.async = function(ids, callback) {
    if (typeof ids === 'string') ids = [ids]
    callback = callback || noop

    var args = ids.map(function(id) {
      return req(id) // Only support local filesystem path
    })

    callback.apply(null, args)
  }

  return req
}


// Helpers
// -------

var aliasCache = {}
var Module = require('module')

function parseAlias(id) {
  // #xxx means xxx is already alias-parsed.
  if (id.charAt(0) === '#') {
    return id.substring(1)
  }

  var alias = aliasCache

  // Only top-level id needs to parse alias.
  if (alias && isTopLevel(id)) {
    var parts = id.split('/')
    var first = parts[0]

    if (alias.hasOwnProperty(first)) {
      parts[0] = alias[first]
      id = parts.join('/')
    }
  }

  return id
}

function resolveFilename(id, contextModule) {
  return isRelative(id) ?
      Module['_resolveFilename'](id, contextModule) :
      id
}

function isRelative(id) {
  return id.indexOf('./') === 0 || id.indexOf('../') === 0
}

function isTopLevel(id) {
  var c = id.charAt(0)
  return id.indexOf('://') === -1 && c !== '.' && c !== '/'
}

function noop() {
}
