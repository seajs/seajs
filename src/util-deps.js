/**
 * The parser for dependencies
 */
;(function(util) {

  // see ../tests/research/parse-dependencies/test.html
  util.parseDependencies = function(code) {
    var ret = [], _strings = [];

    var EXTRACT_RE = /(['"])((:?\\\1|.)+?)\1/g
      , BLOCKCOMMENT_RE = /\/\*[\s\S]*?\*\//mg
      , LINECOMMENT_RE = /\/\/.*$/mg
      , REQUIRE_RE = /(?:^|[^.$])\brequire\s*\(\s*"(\d+)"\s*\)/g
      , FILTER_RE = /^[^"'\s\)]+$/;

    code
      .replace(EXTRACT_RE, function(match, quote, str, index) {  // extract all strings
        return '"' + (_strings.push(str) - 1) + '"';
      })
      .replace(BLOCKCOMMENT_RE, '') // remove block comments
      .replace(LINECOMMENT_RE, '') // remove line comments
      .replace(REQUIRE_RE, function(match, index) {  // parse 'require()'
        if (FILTER_RE.test(_strings[index])) {
          ret.push(_strings[index]);
        }
      });

    return util.unique(ret);
  }

})(seajs._util)

