/**
 * The parser for dependencies
 */
;(function(util) {

  util.parseDependencies = function(code) {
    var ret = [], _strings = [];

    code
      .replace(/(['"])((:?\\\1|.)+?)\1/g, function(match, quote, str, index) {  // extract all strings
        _strings.push(str);
        return '"' + (_strings.length - 1) + '"';
      })
      .replace(/\/\*[\s\S]*?\*\//mg, '') // remove block comments
      .replace(/\/\/.*$/mg, '') // remove line comments
      .replace(/(?:^|[^.$])\brequire\s*\(\s*"(\d+)"\s*\)/g, function(match, index) {  // parse 'require()'
        if (index && _strings[index]) {
          ret.push(_strings[index]);
        }
      });

    return util.unique(ret);
  }

})(seajs._util)

