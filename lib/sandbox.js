/**
 * The fake sandbox of browser environment
 */

exports.document = {

  getElementById: function(id) {
    // Return the fake loader script node
    if (id === "seajsnode") {
      return {
        hasAttribute: true,
        getAttribute: function() {},
        src: __filename
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
  }
}

exports.location = {
  href: process.cwd() + "/index.js",
  search: ""
}

exports.navigator = {
  userAgent: ""
}

exports.console = console
exports.exports = { console: console }

