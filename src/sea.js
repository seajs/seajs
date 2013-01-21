
var seajs = global.seajs = {
  // The current version of SeaJS being used
  version: "@VERSION"
}

// The flag for test environment
var TEST_MODE = true

// Such code bellow will be removed when building
if (TEST_MODE) {
  var test = seajs.test = {}
}


