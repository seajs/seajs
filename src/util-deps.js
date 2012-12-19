/**
 * The parser for dependencies
 */
;(function(util) {

  var COMMENT_RE = /(\/\*([\s\S]*?)\*\/|([^:]|^)\/\/(.*)$)/mg
  var REQUIRE_RE = /(?:^|[^.$])\brequire\s*\(\s*(["'])([^"'\s\)]+)\1\s*\)/g
  var LINE_RE = /;/g


  // see ../tests/research/parse-dependencies/test.html
  util.parseDependencies = function(code) {
    code = code.replace(LINE_RE, '').replace(COMMENT_RE, '')

    var ret = [], match
    REQUIRE_RE.lastIndex = 0

    while ((match = REQUIRE_RE.exec(code))) {
      if (match[2]) {
        ret.push(match[2])
      }
    }

    return util.unique(ret)
  }

})(seajs._util)

