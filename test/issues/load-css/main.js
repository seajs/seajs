define(function(require) {

  var test = require('../../test')
  var $ = require('../../third-party').jQuery
  var count = 0


  // normal case
  require('./red.css')
  test.assert($('#red').width() === 200, '#red width should be 200')


  // async case
  test.assert($('#blue').width() !== 200, '#blue width should not be 200. The actual value is ' + $('#blue').width())
  require.async('./blue.css', function() {
    setTimeout(function() {
      test.assert($('#blue').width() === 200, '#blue width should be 200 now')
      done()
    }, 500) // 留够时间给 css 渲染
  })


  // not-existed case
  // 注意：Opera 下不会触发回调
  require.async('./not-existed.css', function() {
    test.print('[PASS] 404 is ok')
    done()
  })


  // don't load multi times
  var linkCount = document.getElementsByTagName('link').length
  require.async('./red.css', function() {
    var currentLinkCount = document.getElementsByTagName('link').length
    test.assert(currentLinkCount === linkCount, 'do NOT load duplicate link')
    done()
  })


  var MAX = 3
  if (window.opera) MAX--

  function done() {
    if (++count === MAX) {
      test.done()
    }
  }

})
