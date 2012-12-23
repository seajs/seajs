/**
 * The parser for dependencies
 * Ref: tests/research/parse-dependencies/test.html
 */
;(function(util) {

  var REQUIRE_RE = /"(?:\\"|[^"])*"|'(?:\\'|[^'])*'|\/\*[\S\s]*?\*\/|\/(?:\\\/|[^/\r\n])+\/(?=[^\/])|\/\/.*|\.\s*require|(?:^|[^$])\brequire\s*\(\s*(["'])(.+?)\1\s*\)/g
  var SLASH_RE = /\\\\/g

  util.parseDependencies = function(code) {
    var ret = [], m
    REQUIRE_RE.lastIndex = 0
    code = code.replace(SLASH_RE, '')

    while ((m = REQUIRE_RE.exec(code))) {
      if (m[2]) ret.push(m[2])
    }

    return util.unique(ret)
  }

})(seajs._util)

