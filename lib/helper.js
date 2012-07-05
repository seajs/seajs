/**
 * Helpers for sea-node.js
 * @author lifesinger@gmail.com
 */

var aliasCache = {}
var url = require('url')


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


// Reads content from http(s)/local filesystem
exports.readFile = function(uri, callback) {
  var options = url.parse(uri)
  var connect = require(options.protocol.slice(0, -1))

  connect.get(options, function(res) {
    if (res.statusCode !== 200) {
      throw 'Error: No data received from ' + uri
    }

    var ret = [], length = 0

    res.on('data', function(chunk) {
      length += chunk.length
      ret.push(chunk)
    })

    callback && res.on('end', function() {
      var buf = new Buffer(length), index = 0

      ret.forEach(function(chunk) {
        chunk.copy(buf, index, 0, chunk.length)
        index += chunk.length
      })

      var data = buf.toString()
      callback(data)
    })

  })
}


// Helpers
// -------

function isTopLevel(id) {
  var c = id.charAt(0)
  return id.indexOf('://') === -1 && c !== '.' && c !== '/'
}
