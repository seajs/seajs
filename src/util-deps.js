/**
 * The parser for dependencies
 */
;(function(util) {

  var DEPS_RE = /(?:^|[^.$])\brequire\s*\(\s*(["'])([^"'\s\)]+)\1\s*\)/g
  var BLOCK_COMMENT_RE = /(?:^|\n|\r)\s*\/\*[\s\S]*?\*\/\s*(?:\r|\n|$)/g
  var LINE_COMMENT_RE = /(?:^|\n|\r)\s*\/\/.*(?:\r|\n|$)/g


  util.parseDependencies = function(code) {
    // Parse these `requires`:
    //   var a = require('a');
    //   someMethod(require('b'));
    //   require('c');
    //   ...
    // Doesn't parse:
    //   someInstance.require(...);
    var ret = [], match

    code = removeComments(code)
    DEPS_RE.lastIndex = 0

    while ((match = DEPS_RE.exec(code))) {
      if (match[2]) {
        ret.push(match[2])
      }
    }

    return util.unique(ret)
  }

  // http://lifesinger.github.com/lab/2011/remove-comments-safely/
  function removeComments(code) {
    BLOCK_COMMENT_RE.lastIndex = 0
    LINE_COMMENT_RE.lastIndex = 0

    return code
        .replace(BLOCK_COMMENT_RE, '\n')
        .replace(LINE_COMMENT_RE, '\n')
  }

})(seajs._util)
