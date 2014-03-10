define(function(require) {

  var test = require('../test')

  test.assert(typeof seajs.importStyle === 'function', 'seajs.importStyle')

  seajs.importStyle('.a { color: blue }')
  seajs.importStyle('.b { color: red }', 'b.css')
  seajs.importStyle('.c { color: green }', 'c.css')
  seajs.importStyle('.b { color: red }', 'b.css')
  seajs.importStyle('.d { color: yellow }')
  seajs.importStyle('.e { color: white }')

  var styleCount = document.getElementsByTagName('style').length
  test.assert(styleCount === 3, styleCount)

  var styleEl = document.getElementById('b-css')
  var cssText = styleEl.innerHTML || styleEl.styleSheet.cssText
  test.assert(cssText.indexOf('.b') >= 0, 'b.css')

  styleEl = document.getElementsByTagName('style')[0]
  cssText = styleEl.innerHTML || styleEl.styleSheet.cssText
  test.assert(cssText.indexOf('.d') >= 0, 'same style node')
  test.assert(cssText.indexOf('.e') >= 0, 'same style node')
  test.assert(cssText.indexOf('.b') === -1, 'same style node')
  test.assert(cssText.indexOf('.c') === -1, 'same style node')

  test.next()

})
