
// For browsers
var testSuites = [
  'specs/util',

  'specs/config',
  'specs/module',
  'specs/package',
  'specs/extensible',

  'specs/misc/bootstrap',
  'specs/misc/callback-order',
  'specs/misc/ie-cache',
  'specs/misc/load-perf',
  'specs/misc/on-error',
  'specs/misc/utf8-in-gbk',
  'specs/misc/x-ua-compatible',

  'research/derive-uri',

  'specs/standalone',
  'specs/runtime'
]

// For seajs in node
if (typeof define === 'function') {
  define([
    'specs/config',
    'specs/module',
    'specs/package',
    'specs/node'
  ])
}

