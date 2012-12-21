/**
 * The parser for dependencies
 */
;(function(util) {

  var NOISE_RE = /(['"])((?:\\\1|[\s\S])+?)\1|\/\*[\S\s]*?\*\/|\/(?:\\\/|[^/])+\/|\/\/.*/g
  var REQUIRE_RE = /(?:^|[^.$])\brequire\s*\(\s*(["'])(.+?)\1\s*\)/g

  // see ../tests/research/parse-dependencies/test.html
  util.parseDependencies = function(code) {
  	var ret = [], match
  	var primatives = [], primIndex = 0

    // Remove comments and regexp
    code = code.replace(NOISE_RE, function(m, quot, str) {
    	if(quot){
    		primatives[++primIndex] = str
    		return quot + primIndex + quot
    	}
      	return ''
    })

    REQUIRE_RE.lastIndex = 0
    while ((match = REQUIRE_RE.exec(code))) {
		ret.push(primatives[match[2]])
    }

    return util.unique(ret)
  }

})(seajs._util)

