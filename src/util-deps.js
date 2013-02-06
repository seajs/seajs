/**
 * util-deps.js - The parser for dependencies
 * ref: tests/research/parse-dependencies/test.html
 */

var REQUIRE_RE = /"(?:\\"|[^"])*"|'(?:\\'|[^'])*'|\/\*[\S\s]*?\*\/|\/(?:\\\/|[^/\r\n])+\/(?=[^\/])|\/\/.*|\.\s*require|(?:^|[^$])\brequire\s*\(\s*(["'])(.+?)\1\s*\)/g
var SLASH_RE = /\\\\/g

function parseDependencies(code) {
  var ret = [], m
  REQUIRE_RE.lastIndex = 0
  code = code.replace(SLASH_RE, "")

  while ((m = REQUIRE_RE.exec(code))) {
    if (m[2]) ret.push(m[2])
  }

  return ret
}


