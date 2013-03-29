(function(global) {

  var result = global.result = {}
  var currentPage, currentSuite
  var isRunning, timeoutTimer
  var startTime, endTime
  var page

  var publish = global.publish || function() {}
  var consoleMode = location.search.indexOf('console') > 0

  var container = document.getElementById('container')
  var summary = document.getElementById('summary')
  var reporter = document.getElementById('reporter')
  var go = document.getElementById('go')

  document.getElementById('info').innerHTML = navigator.userAgent

  document.getElementById('hide-pass').onclick = function() {
    reporter.className = this.checked ? 'hide-pass' : ''
  }

  go.onclick = function() {
    if (currentPage === 0) {
      start()
    }
    else {
      isRunning ? pause() : next()
    }
  }

  global.onload = start


  function start() {
    reporter.innerHTML = ''
    reset()

    publish('start')
    startTime = now()
    next()
  }

  function next() {
    isRunning = true
    go.innerHTML = 'Pause'
    testNextPage()
  }

  function pause() {
    isRunning = false
    go.innerHTML = 'Resume'
  }

  function reset() {
    currentPage = 0
    result.pass = { count: 0 }
    result.fail = { count: 0, suites: [] }
    result.warn = { count: 0, suites: [] }
    result.error = { count: 0, suites: [] }

    isRunning = false
    go.innerHTML = 'Go'
    timeoutTimer = 0
  }


  global.testNextPage = function() {
    if (page) {
      publish('testEnd', page, {
        pass: result.pass.count,
        fail: result.fail.count,
        error: result.error.count
      })
    }

    page = testSuites[currentPage++]
    clearTimeout(timeoutTimer)
    clear()

    if (page) {
      // Paused
      if (isRunning === false) {
        printResult('[PAUSED]', 'warn paused')
        printStepInfo()
        printErrors()
        return
      }

      // Load page
      var url = getUrl(page)
      printHeader(page, url, 'h2')
      
      publish('test', page)
      load(url)
      makeSureGoOn(page)

      printStepInfo()
    }
    // All done
    else {
      endTime = now()
      printStepInfo()
      printErrors()
      printHeader('END', '', 'h2')
      publish('end')
      reset()
    }
  }

  global.printHeader = function(title, url, tag) {
    var h = document.createElement(tag || 'h3')
    h.innerHTML = title + getHeaderLink(url)

    reporter.appendChild(h)
    scroll()

    currentSuite = { title: title, url: url }
    consoleMode && print2Console(title)
  }

  global.printResult = function(txt, style) {
    var d = document.createElement('div')
    d.innerHTML = txt
    d.className = style

    reporter.appendChild(d)
    scroll()

    var r = result[style]
    if (r) {
      r.count += 1
      r.suites && r.suites.push(currentSuite)
    }

    consoleMode && print2Console(txt, style)
  }


  // Helpers

  function printStepInfo() {
    var page = testSuites[currentPage - 1]

    var html = summary.innerHTML =
        (currentPage - 1) + ' / ' + testSuites.length + ' { &nbsp;' +
            'Passed: <span class="pass">' + result.pass.count + '</span> ' +
            'Failed: <span class="fail">' + result.fail.count + '</span> ' +
            'Errors: <span class="error">' + result.error.count + '</span>}' +
            '&nbsp; ' +
            (page ?
                'Running ' + page + ' ... ' :
                'Elapsed time: ' + (endTime - startTime) / 1000 + 's')

    if (!page && consoleMode) {
      printHeader('Summary', '', 'h2')
      print2Console(html.replace(/&nbsp;/g, '').replace(/<\/?span[^>]*>/g, ''))
    }
  }

  function printErrors() {
    if (result.fail.count + result.error.count + result.warn.count === 0) {
      return
    }

    printHeader('Error cases:', '', 'h2')

    for (var type in result) {
      if (type === 'pass') continue
      var obj = result[type]

      if (obj.count) {
        var suites = obj.suites

        for (var i = 0, len = suites.length; i < len; i++) {
          var suite = suites[i]
          printResult('[' + type.toUpperCase() + '] ' + suite.title + ' ' +
              (consoleMode ?
                  '' :
                  '<a class="hash" target="_blank" href="' + suite.url + '">#</a>'),
              type + ' error-summary')
        }
      }
    }
  }

  function getUrl(page) {
    return page + '/test.html'
  }

  function clear() {
    var iframes = document.getElementsByTagName('iframe')
    var length = iframes.length

    for (var i = 0; i < length; i++) {
      iframes[i].parentNode.removeChild(iframes[i])
    }
  }

  function load(url) {
    setTimeout(function() {
      var frame = document.createElement('iframe')
      container.appendChild(frame)
      frame.src = url
    }, 0) // Give a break for IE to work properly
  }

  function getHeaderLink(url) {
    return url ?
        ' <a class="hash" target="_blank" href="' + url + '">#</a>' :
        ''
  }

  function makeSureGoOn(page) {
    timeoutTimer = setTimeout(function() {
      printResult('[WARN] Time is out for ' + page, 'warn')
      testNextPage()
    }, 2 * 60 * 1000) // Wait 120s
  }

  function print2Console(msg, type) {
    type = type ? type.split(' ')[0] : 'info'
    console.log(type + '`' + msg)
  }

  function scroll() {
    reporter.scrollTop = reporter.scrollHeight
  }

  function now() {
    return new Date().getTime()
  }

})(this);

