// Localstorage object
// Simple Store: https://github.com/marcuswestin/store.js/blob/master/store.js

  var doc = document,
    win = window,
    loc = location

  var store = {};

  var localStorageName = 'localStorage',
    namespace = '__storejs__',
    storage

  store.disabled = false
  store.set = function(key, value) {
  }
  store.get = function(key) {
  }

  // Different from store.js
  function isString(val) {
    return {}.toString.call(val) == "[object String]"
  }

  store.serialize = function(value) {
    if (isString(value)) return value

    // isObject
    var html = []
    for (var key in value) {
      var val = value[key]
      if (isString(val)) {
        val = val.replace(/'/g, '"').replace(/\n/g, '\\n').replace(/\r/g, '\\r')
        val = "'" + val + "'"
      }
      // isArray
      else if (val.hasOwnProperty("length")) {
        var tmp = []
        for (var i = 0; i < val.length; i++) {
          var f = trim(val[i][0])
          var t = trim(val[i][1])

          f.length && t.length && tmp.push('["' + f + '","' + t + '"]')
        }
        val = '[' + tmp.join(',') + ']'
      }
      html.push('' + key + ':' + val)
    }
    return "{" + html.join(",") + "}"
  }
  store.deserialize = function(value) {
    if (!isString(value)) return undefined
    try {
      return (new Function("return " + value))()
    }
    catch (e) {
      return undefined
    }
  }
  // end

  function isLocalStorageNameSupported() {
    try {
      return (localStorageName in win && win[localStorageName])
    }
    catch (err) {
      return false
    }
  }

  if (isLocalStorageNameSupported()) {
    storage = win[localStorageName]
    store.set = function(key, val) {
      if (val === undefined) {
        return store.remove(key)
      }
      storage.setItem(key, store.serialize(val))
      return val
    }
    store.get = function(key) {
      return store.deserialize(storage.getItem(key))
    }
  } else if (doc.documentElement.addBehavior) {
    var storageOwner,
      storageContainer
    try {
      storageContainer = new ActiveXObject('htmlfile')
      storageContainer.open()
      storageContainer.write('<s' + 'cript>document.w=window</s' + 'cript><iframe src="/favicon.ico"></iframe>')
      storageContainer.close()
      storageOwner = storageContainer.w.frames[0].document
      storage = storageOwner.createElement('div')
    } catch (e) {
      storage = doc.createElement('div')
      storageOwner = doc.body
    }
    function withIEStorage(storeFunction) {
      return function() {
        var args = Array.prototype.slice.call(arguments, 0)
        args.unshift(storage)
        storageOwner.appendChild(storage)
        storage.addBehavior('#default#userData')
        storage.load(localStorageName)
        var result = storeFunction.apply(store, args)
        storageOwner.removeChild(storage)
        return result
      }
    }

    var forbiddenCharsRegex = new RegExp("[!\"#$%&'()*+,/\\\\:;<=>?@[\\]^`{|}~]", "g")

    function ieKeyFix(key) {
      return key.replace(forbiddenCharsRegex, '___')
    }

    store.set = withIEStorage(function(storage, key, val) {
      key = ieKeyFix(key)
      if (val === undefined) {
        return store.remove(key)
      }
      storage.setAttribute(key, store.serialize(val))
      storage.save(localStorageName)
      return val
    })
    store.get = withIEStorage(function(storage, key) {
      key = ieKeyFix(key)
      return store.deserialize(storage.getAttribute(key))
    })
  }

  try {
    store.set(namespace, namespace)
    if (store.get(namespace) != namespace) {
      store.disabled = true
    }
    store.remove(namespace)
  } catch (e) {
    store.disabled = true
  }

  // Helpers

  function trim(str) {
    var whitespace = ' \n\r\t\f\x0b\xa0\u2000\u2001\u2002\u2003\u2004\u2005\u2006\u2007\u2008\u2009\u200a\u200b\u2028\u2029\u3000'
    for (var i = 0, len = str.length; i < len; i++) {
      if (whitespace.indexOf(str.charAt(i)) === -1) {
        str = str.substring(i)
        break
      }
    }
    for (i = str.length - 1; i >= 0; i--) {
      if (whitespace.indexOf(str.charAt(i)) === -1) {
        str = str.substring(0, i + 1);
        break
      }
    }
    return whitespace.indexOf(str.charAt(0)) === -1 ? str : ''
  }
