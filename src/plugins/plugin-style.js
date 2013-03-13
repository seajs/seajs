/**
 * Add importStyle method to seajs
 */
(function(seajs) {

  var RE_NON_WORD = /\W/g
  var doc = document
  var head = document.getElementsByTagName('head')[0] ||
      document.documentElement

  seajs.importStyle = function(cssText, id) {
    if (id) {
      // Convert id to valid string
      id = id.replace(RE_NON_WORD, '-')

      // Don't add multiple times
      if (doc.getElementById(id)) return
    }

    var element = doc.createElement('style')
    id && (element.id = id)

    // Adds to DOM first to avoid the css hack invalid
    head.appendChild(element)

    // IE
    if (element.styleSheet) {

      // http://support.microsoft.com/kb/262161
      if (doc.getElementsByTagName('style').length > 31) {
        throw new Error('Exceed the maximal count of style tags in IE')
      }

      element.styleSheet.cssText = cssText
    }
    // W3C
    else {
      element.appendChild(doc.createTextNode(cssText))
    }
  }

})(seajs);

