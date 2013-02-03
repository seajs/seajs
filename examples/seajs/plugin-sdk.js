/**
 * The SDK for plugin development
 */
define('{seajs}/plugin-sdk', [], function(require, exports) {

  var util = exports.util = {}


  util.xhr = function (url, callback) {
    var r = window.ActiveXObject ?
        new window.ActiveXObject('Microsoft.XMLHTTP') :
        new window.XMLHttpRequest()

    r.open('GET', url, true)

    r.onreadystatechange = function() {
      if (r.readyState === 4) {
        if (r.status === 200) {
          callback(r.responseText)
        }
        else {
          throw new Error('Could not load: ' + url + ', status = ' + r.status)
        }
      }
    }

    return r.send(null)
  }


  util.globalEval = function (data) {
    if (data && /\S/.test(data)) {
      (window.execScript || function(data) {
        window['eval'].call(window, data)
      })(data)
    }
  }

});

