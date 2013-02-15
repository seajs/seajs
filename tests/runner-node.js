/**
 * Run test specs in node environment
 * Usage:
 *   $ cd seajs
 *   $ node tests/runner-node.js
 */

require("../lib/sea.js")
var test = require("./test.js")

var cases = {
  "tests/specs/module": [
    "anonymous",
    "anywhere",
    "cache",
    "chain",
    "circular",
    "define",
    "dependencies",
    "duplicate-load",
    "singleton",
    "exports",
    "jsonp",
    "load-css",
    "math",
    "method",
    "multi-load",
    "multi-versions",
    "override",
    "public-api",
    "require-async",
    "transitive"
  ]
}

var specs = []

Object.keys(cases).forEach(function(path) {
  specs = specs.concat(cases[path].map(function(spec) {
    return path + "/" + spec
  }))
})

test.run(specs)

