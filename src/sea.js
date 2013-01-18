var seajs = {
  // The current version of SeaJS being used
  version: "@VERSION"
}

// Debug mode that will be turned off when building
var debugMode = "@DEBUG"

// The flag for test environment
var TEST_MODE = true

// Such code bellow will be removed when building
if (TEST_MODE) {
  var test = seajs.test = {}
}


