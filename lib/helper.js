/**
 * Helpers for sea-node.js
 * @author lifesinger@gmail.com
 */

var aliasCache = {}

exports.parseAlias = function (id) {
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


function isTopLevel(id) {
  var c = id.charAt(0)
  return id.indexOf('://') === -1 && c !== '.' && c !== '/'
}
