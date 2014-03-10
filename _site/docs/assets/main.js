/**
 * module for seajs.org
 */
define(function(require) {

  var navs = document.getElementById('nav').getElementsByTagName('a')
  var pages = getElementsByClassName('content', 'page')

  var extraCode = {
    'intro': function() {
      require.async(['jquery'], function($) {
        initLazySrc($)
      })
    },

    'quick-start': function() {
      var iframe = document.getElementById('quick-start-iframe')
      iframe.src = 'http://seajs.github.io/examples/app/hello.html'

      require.async('./sh', function(highlight) {
        highlight.init()
      })
    }
  }

  bindEvents()
  updateView()
  misc()


  // Helpers

  function updateView(pageId) {
    pageId || (pageId = location.hash.substring(1))
    document.getElementById('page-' + pageId) || (pageId = 'intro')

    setActiveNav(pageId)
    setActivePage(pageId)
    window.scrollTo(0, 0)
  }

  function setActiveNav(pageId) {
    for (var i = 0, len = navs.length; i < len; i++) {
      var link = navs[i]
      var isActive = link.href.slice(-pageId.length) === pageId
      link.className = isActive ? 'active' : ''
    }
  }

  function setActivePage(pageId) {
    for (var i = 0, len = pages.length; i < len; i++) {
      var page = pages[i]
      var isActive = page.id === 'page-' + pageId
      page.className = isActive ? 'page page-active' : 'page'
    }

    if (extraCode[pageId]) {
      extraCode[pageId]()
      delete extraCode[pageId]
    }
  }

  function bindEvents() {
    if ('onhashchange' in window) {
      window.onhashchange = function() {
        updateView()
      }
      return
    }

    var links = document.getElementsByTagName('a')

    for (var i = 0, len = links.length; i < len; i++) {
      var link = links[i]

      if (isPageNav(link.href)) {
        link.onclick = function() {
          updateView(this.href.replace(/.*#(\w+).*/, '$1'))
        }
      }
    }
  }

  function isPageNav(href) {
    if (href.indexOf('#') === -1) return false
    return document.getElementById('page-' + href.replace(/.*#(\w+).*/, '$1'))
  }

  function initLazySrc($) {
    var elements = $('#page-intro img, #page-intro iframe')

    elements.each(function(i, elem) {
      elem = $(elem)
      var dataSrc = elem.attr('data-src')
      if (dataSrc) {
        elem.attr('src', dataSrc)
      }
    })
  }

  function getElementsByClassName(root, className) {
    root = document.getElementById(root)

    if (root.getElementsByClassName) {
      return root.getElementsByClassName(className)
    }

    var elements = root.getElementsByTagName('*')
    var ret = []

    for (var i = 0, len = elements.length; i < len; i++) {
      var elem = elements[i]
      if ((' ' + elem.className + ' ').indexOf(' ' + className + ' ') > -1) {
        ret.push(elem)
      }
    }

    return ret
  }

  function misc() {
    if (navigator.userAgent.indexOf(' Trident') > 0) {
      document.body.className += 'ie'
    }
  }

})

