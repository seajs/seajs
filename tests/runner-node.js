/**
 * Run test specs in node environment
 * Usage:
 *   $ cd seajs
 *   $ node tests/runner-node.js
 */

require("../lib/sea.js")
var test = require("./test.js")

var specs = [
  "module/anonymous",
  "module/anywhere",
  "module/cache",
  "module/chain",
  "module/circular",
  "module/define",
  "module/dependencies",
  "module/duplicate-load",
  "module/singleton",
  "module/exports",
  "module/jsonp",
  "module/load-css",
  "module/math",
  "module/method",
  "module/multi-load",
  "module/multi-versions",
  "module/override",
  "module/public-api",
  "module/require-async",
  "module/transitive"
]

// go
test.run(specs)

