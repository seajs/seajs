/**
 * This plugin can tweak http request of scripts for performance
 */
(function(seajs) {

  var slice = [].slice
  var _use = seajs.use
  var stack = []

  seajs.use = function(ids, callback) {
    stack.push([isArray(ids) ? ids : [ids], callback])
    return seajs
  }

  seajs.flush = function() {
    var ids = []
    var callbacks = []

    for (var i = 0; i < stack.length; i++) {
      var args = stack[i]
      ids[i] = args[0]
      callbacks[i] = args[1]
    }

    stack.length = 0

    return _use(flatten(ids), function() {
      var args = group(slice.call(arguments), ids)

      for (var i = 0; i < callbacks.length; i++) {
        var callback = callbacks[i]
        if (callback) {
          callback.apply(null, args[i])
        }
      }
    })
  }

  function flatten(arr, ret) {
    ret || (ret = [])

    for (var i = 0; i < arr.length; i++) {
      var item = arr[i]
      isArray(item) ? flatten(item, ret) : ret.push(item)
    }

    return ret
  }

  function group(args, ids) {
    var ret = []
    var item, arr

    for (var i = 0; i < ids.length; i++) {
      ret[i] = arr = []
      item = ids[i]

      for (var j = 0; j < item.length; j++) {
        arr[j] = args.shift()
      }
    }

    return ret
  }

  var toString = {}.toString

  var isArray = Array.isArray || function(obj) {
    return toString.call(obj) === "[object Array]"
  }

})(seajs);

