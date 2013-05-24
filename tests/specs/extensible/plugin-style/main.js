define(function(require) {

  var test = require('../../../test')

  test.assert(typeof seajs.importStyle === 'function', 'seajs.importStyle')

  seajs.importStyle('.a { color: blue }')
  seajs.importStyle('.b { color: red }', 'b.css')
  seajs.importStyle('.c { color: green }', 'c.css')
  seajs.importStyle('.b { color: red }', 'b.css')

  var styleCount = document.getElementsByTagName('style').length
  test.assert(styleCount === 3, styleCount)

  var styleEl = document.getElementById('b-css')
  var cssText = styleEl.innerHTML || styleEl.styleSheet.cssText
  test.assert(cssText.indexOf('.b') >= 0, 'b.css')

  test.next()

})
