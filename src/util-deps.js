/**
 * The parser for dependencies
 */
;(function(util) {

  var COMMENT_RE = /(\/\*([\s\S]*?)\*\/|([^:]|^)\/\/(.*)$)/mg
  var REQUIRE_RE = /(?:^|[^.$])\brequire\s*\(\s*(["'])([^"'\s\)]+)\1\s*\)/g


  util.parseDependencies = function(code) {
    // Remove Comments
    // ref: research/remove-comments-safely
    code = code.replace(COMMENT_RE, '')

    // Parse these `requires`:
    //   var a = require('a');
    //   someMethod(require('b'));
    //   require('c');
    //   ...
    // Doesn't parse:
    //   someInstance.require(...);
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

