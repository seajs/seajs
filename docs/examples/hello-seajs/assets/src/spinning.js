define(function(require, exports) {

  var $ = require('jquery')
  var TRANSFORM = $.browser.webkit ? '-webkit-transform' :
                  $.browser.mozilla ? '-moz-transform' :
                  $.browser.opera ? '-o-transform' : 'transform'

  function random(x) { return Math.random() * x }


  exports.spinning = function(icons) {

    $(icons).each(function(n) {
      var startDeg = random(360)
      var node = $(this)
      var timer

      node.css({
              top: random(40),
              left: n * 50 + random(10),
              zIndex: 1000
            })
          .hover(function() {
              node.fadeTo(250, 1)
                  .css('zIndex', 1001)
                  .css(TRANSFORM, 'rotate(0deg)')

      }, function() {
            node.fadeTo(250, .6).css('zIndex', 1000)
            timer && clearTimeout(timer)
            timer = setTimeout(resetPlace, Math.floor(random(10000)))
          })

      function resetPlace() {
        node.css(TRANSFORM, 'rotate(' + startDeg + 'deg)')
      }

      resetPlace()
    })
  }

})
