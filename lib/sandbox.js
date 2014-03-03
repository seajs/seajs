/**
 * The fake sandbox of browser environment
 */

var path = require("path")
var normalize = require("./winos").normalize

exports.document = {

  getElementById: function(id) {
    // Return the fake loader script node
    if (id === "seajsnode") {
      return {
        hasAttribute: true,
        getAttribute: function() {},
        src: normalize(path.join(__dirname, "../dist/sea.js"))
      }
    }
  },

  getElementsByTagName: function(tag) {
    // Return the fake head node
    if (tag === "head") {
      return [{
          getElementsByTagName: function() {
            return []
          }
      }]
    }

    return []
  },

  URL: normalize(process.cwd() + "/index.js"),

  scripts: []
}

exports.location = {
  search: ""
}

exports.navigator = {
  userAgent: ""
}

exports.console = console
exports.exports = { console: console }
exports.setTimeout = setTimeout
exports.process = process

