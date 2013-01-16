/**
 * Helpers for sea-node.js
 * @author lifesinger@gmail.com
 */

var url = require('url')

var VARS_RE = /{([^{}]+)}/g
var cache = { 'alias': {}, 'vars': {} }


exports.parseAlias = function (id) {
  var alias = cache.alias

  // Only top-level id needs to parse alias.
  if (alias.hasOwnProperty(id) && isTopLevel(id)) {
    id = alias[id]
  }

  return id
}


exports.parseVars = function (id) {
  var vars = cache.vars

  if (id.indexOf('{') > -1) {
    id = id.replace(VARS_RE, function(m, key) {
      return vars.hasOwnProperty(key) ? vars[key] : key
    })
  }

  return id
}


exports.configFn = function(obj) {
  config(obj, 'alias')
  config(obj, 'vars')
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


function config(obj, key) {
  if (obj && obj[key]) {
    var val = obj[key]

    for (var p in val) {
      if (val.hasOwnProperty(p)) {
        cache[key][p] = val[p]
      }
    }
  }
}

