/**
 * The parser for dependencies
 */
;(function(util) {

  var NOISE_RE = /"(?:\\"|[^"])*"|'(?:\\'|[^'])*'|\/(?:\\\/|[^/])+\/|\/\*[\S\s]*?\*\/|\/\/.*/g
  var STR_RE = /^["']/
  var REQUIRE_RE = /(?:^|[^.$])\brequire\s*\(\s*(["'])([-_.:\w\d\/]+)\1\s*\)/g


  // see ../tests/research/parse-dependencies/test.html
  util.parseDependencies = function(code) {
    var ret = [], match

    // Remove comments and regexp
    code = code.replace(NOISE_RE, function(m) {
      return STR_RE.test(m) ? m : ''
    })

    REQUIRE_RE.lastIndex = 0
    while ((match = REQUIRE_RE.exec(code))) {
      ret.push(match[2])
    }

    return util.unique(ret)
  }

})(seajs._util)

