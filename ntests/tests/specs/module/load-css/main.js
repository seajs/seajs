
// For Node.js
if (typeof process !== 'undefined') {
define(function(require) {

  var test = require('../../../test')
  test.next()

})}
else {
define(function(require) {

  var test = require('../../../test')
  var count = 0

  // prepare DOM elements
  var out = document.getElementById('out')

  var red = document.createElement('p')
  red.id = 'load-css-red'
  red.innerHTML = 'This paragraph should be red'
  out.appendChild(red)

  var blue = document.createElement('p')
  blue.id = 'load-css-blue'
  blue.innerHTML = 'This paragraph should be blue'
  out.appendChild(blue)


  // normal case
  require('./red.css')
  test.assert(hasThisLinkStyle('red.css'), 'red.css is loaded')


  // async case
  test.assert(hasThisLinkStyle('blue.css'), 'blue.css is not available now')
  require.async('./blue.css', function() {
    test.assert(hasThisLinkStyle('blue.css'), 'blue.css is loaded')
    done()
  })


  // not-existed case
  require.async('./not-existed.css', function() {
    test.assert(true, '404 is ok')
    done()
  })
  if (window.opera) {
    test.assert(true, '**NOTICE: Opera do NOT fire onerror event of css file')
    done()
  }


  // don't load multi times
  var linkCount = document.getElementsByTagName('link').length
  require.async('./red.css', function() {
    var currentLinkCount = document.getElementsByTagName('link').length
    test.assert(currentLinkCount === linkCount, 'do NOT load a link multiple times')
    done()
  })


  var MAX = 3

  function done() {
    if (++count === MAX) {
      test.next()
    }
  }


  function hasThisLinkStyle(flag) {
    var links = document.getElementsByTagName('link')
    var length = links.length
    var found = false

    for (var i = 0; i < length; i++) {
      var link = links[i]
      if (link.getAttribute('href').indexOf(flag)) {
        found = true
        break
      }
    }

    return found
  }

})}

