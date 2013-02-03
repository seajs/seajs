define(function(require) {

  var test = require('../../../test')

  var compatibleElement = document.getElementsByTagName('meta')[2]
  var baseElement = document.getElementsByTagName('base')[0]

  var head = document.getElementsByTagName('head')[0]
  var scripts = head.getElementsByTagName('script')

  var firstScript = scripts[0]
  var lastScript = scripts[scripts.length - 1]

  var nextElement = nextSiblingElement(compatibleElement)
  test.assert(nextElement === firstScript, 'script after compatible meta')


  var linkElement = previousSiblingElement(baseElement)
  var prevElement = previousSiblingElement(linkElement)
  test.assert(prevElement === lastScript, 'script before base element')

  test.next()


  function nextSiblingElement(node) {
    var sibling = node

    do {
      sibling = sibling.nextSibling
    }
    while (sibling && sibling.nodeType !== 1)

    return sibling
  }


  function previousSiblingElement(node) {
    var sibling = node

    do {
      sibling = sibling.previousSibling
    }
    while (sibling && sibling.nodeType !== 1)

    return sibling
  }

});
