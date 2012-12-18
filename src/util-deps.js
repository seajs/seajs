/**
 * The parser for dependencies
 */
;(function(util) {

  var REQUIRE_RE = /(?:^|[^.$])\brequire\s*\(\s*(["'])([^"'\s\)]+)\1\s*\)/g


  util.parseDependencies = function(code) {
    // Parse these `requires`:
    //   var a = require('a');
    //   someMethod(require('b'));
    //   require('c');
    //   ...
    // Doesn't parse:
    //   someInstance.require(...);
    var ret = [], _strings = [], match;

    // extract all strings
    code = code.replace(/(["'])(.+?)\1/g, function(match, quote, str, index) {
      _strings.push(str);
      return match.replace(str, _strings.length - 1);
    });

    // remove comments
    code = code
      .replace(/\/\*[\s\S]*?\*\//mg, '') // block comments
      .replace(/\/\/.*$/mg, ''); // line comments

    // parse 'require()'
    REQUIRE_RE.lastIndex = 0;
    while ((match = REQUIRE_RE.exec(code))) {
      if (match[2]) {
        ret.push(_strings[match[2]])
      }
    }

    return util.unique(ret)
  }

})(seajs._util)

