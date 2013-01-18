var seajs = {
  // The current version of SeaJS being used
  version: "@VERSION"
}

// The configuration data for the loader
var config = {
  // Debug mode that will be turned off when building
  debug: "@DEBUG",

  // Modules that are needed to load before all other modules
  preload: []
}


// The flag for test environment
var TEST_MODE = true

// Such code bellow will be removed when building
if (TEST_MODE) {
  var test = seajs.test = {}
}


