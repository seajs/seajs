
// For browsers
var testSuites = [
  'specs/util',

  'specs/config',
  'specs/module',
  'specs/package',
  'specs/extensible',
  'specs/extensible/plugin-debug',
  'specs/extensible/plugin-flush',
  'specs/extensible/plugin-style',

  'specs/misc/bootstrap-async',
  'specs/misc/callback-order',
  'specs/misc/data-api',
  'specs/misc/ie-cache',
  'specs/misc/on-error',
  'specs/misc/utf8-in-gbk',
  'specs/misc/x-ua-compatible',

  'research/derive-uri'
]

// For seajs in node
if (typeof define === 'function') {
  define([
    'specs/config',
    'specs/module',
    'specs/package',
    'specs/extensible',

    'specs/node'
  ])
}

