define(function(require) {

  var test = require('../../test')
  var count = 0


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
    test.print('[PASS] 404 is ok')
    done()
  })
  // 注意：Opera 下不会触发回调
  if (window.opera) {
    test.print('[FUCK] Opera do NOT fire onerror event of css file')
    done()
  }


  // don't load multi times
  var linkCount = document.getElementsByTagName('link').length
  require.async('./red.css', function() {
    var currentLinkCount = document.getElementsByTagName('link').length
    test.assert(currentLinkCount === linkCount, 'do NOT load duplicate link')
    done()
  })


  var MAX = 3

  function done() {
    if (++count === MAX) {
      test.done()
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

})
