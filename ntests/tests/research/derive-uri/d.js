(function(global, name) {

  if (global.cacheScript) {
    print(name + '.js is cached')
    return
  }

  print(name + '.js is executed')
  order.push(name.toUpperCase())

  var meta = { name: name }
  var uri = deriveCurrentScriptUri()

  if (uri) {
    save(uri, meta)
  } else {
    global.mod = meta
  }

})(this, 'd')

