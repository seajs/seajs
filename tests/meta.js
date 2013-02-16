
var testSuites = [
  'specs/util'

  , 'specs/config'
  , 'specs/module'
  , 'specs/package'
  , 'specs/extensible'
  , 'specs/extensible/plugin-debug'
  , 'specs/extensible/plugin-flush'

  , 'specs/misc/bootstrap-async'
  , 'specs/misc/data-api'
  , 'specs/misc/ie-cache'
  , 'specs/misc/utf8-in-gbk'
  , 'specs/misc/x-ua-compatible'

  , 'research/derive-uri'
]

if (typeof module !== 'undefined') {
  module.exports = testSuites
}

