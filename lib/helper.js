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

exports.getJSON = function(uri, callback) {
  var options = url.parse(uri)
  var connect = require(options.protocol.slice(0, -1))

  var req = connect.get(options, function(res) {
    if (res.statusCode === 200) {
      var data = ''

      res.on('data', function(chuck) {
        data += chuck
      })

      res.on('end', function() {
        if (callback) {
          data = JSON.parse(data.replace(/(?:^define\(|\);?$)/g, ''))
          callback(data)
        }
      })
    }
    else {
      throw 'Error: No data received from ' + uri
    }
  })
}


function isTopLevel(id) {
  var c = id.charAt(0)
  return id.indexOf('://') === -1 && c !== '.' && c !== '/'
}
