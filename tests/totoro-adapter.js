/**
 * The adapter for totoro-test tool
 */
(function(global) {

  var report = top.report
  var id = location.href.match(/runner\/([^/]+)\//)[1]
  var stats = {
    suites: 0,
    tests: 0,
    passes: 0,
    pending: 0,
    failures: 0
  }

  var baseResult = {
      pass: {count: 0, suites: []},
      fail: {count: 0, suites: []},
      error: {count: 0, suites: []}
  }

  var start, status

  global.publish = function(type, name, result) {
    if (type === 'testEnd') {
      typeMapping.testEnd(getSuiteResult(result))
      var failSuites = result.fail.suites && result.fail.suites.slice(0)
      var errorSuites = result.error.suites && result.error.suites.slice(0)

      baseResult = {
        pass: {count: result.pass.count, suites: result.pass.suites},
        fail: {count: result.fail.count, suites: failSuites},
        error: {count: result.error.count, suites: errorSuites}
      }
      return
    }

    if (type === 'test') {
      baseResult.suiteName = name
      return
    }

    typeMapping[type](baseResult)
  }


  function sendMessage(action, info) {
    report({
      orderId: id,
      action: action,
      info: info
    })
  }


  function getSuiteResult(result) {
    var pass = result.pass
    var fail = result.fail
    var error = result.error
    var failSuites = fail.suites && fail.suites.slice(0)
    var errorSuites = error.suites && error.suites.slice(0)
    return {
      suiteName: baseResult.suiteName,
      pass: {count: (pass.count - baseResult.pass.count), suites: pass.suites},
      fail: {count: (fail.count - baseResult.fail.count), suites: failSuites},
      error: {count: (error.count - baseResult.error.count), suites: error.suites}
    }
  }

  function each(arr, iterator) {
    for (var i = 0, l = arr.length; i < l; i++) {
      iterator.call(null, arr[i], i, arr)
    }
  }

  function subtractSuites(suites1, suites2) {
    var suite2Obj = {}
    var subSuite = []

    each(suites2, function(suite) {
      suite2Obj[suite.title] = suite
    })

    each(suites1, function(suite) {
      if (!suite2Obj[suite.title]) {
        subSuite.push(suite)
      }
    })

    return subSuite
  }


  var typeMapping = {
    'start': function() {
      start = new Date().getTime()
    },

    'test': function() {
    },

    'testEnd': function(result) {
      stats.tests++
      var passed = result.fail.count === 0

      var info = {
        parent: result.suiteName,
        title: result.suiteName,
        speed: 'fast',
        duration: '100ms'
      }

      if (passed) {
        stats.passes += result.pass.count
        status = 'pass'
      } else {
        stats.failures += result.fail.count
        status = 'fail'
        var msg = []
        var suites = subtractSuites(result.fail.suites, baseResult.fail.suites)
        for (var i = 0, len = suites.length; i < len; i++) {
            msg.push(suites[i].title)
        }

        info.message = msg.join(',')
      }

      sendMessage(status, info)
    },

    'end': function() {
      stats.duration = new Date().getTime() - start
      report({
        orderId: id,
        action: 'end',
        info: stats
      })
    }
  }

})(this)

