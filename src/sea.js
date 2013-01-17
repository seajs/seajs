
var seajs = {
  // The current version of SeaJS being used
  // It will be replaced with `major.minor.patch` when building.
  version: '@VERSION'
}


// The utilities for internal use
var util = {}


// The configuration data
var config = {
  // Debug mode. It will be turned off automatically when building.
  debug: '@DEBUG',

  // Modules that are needed to load before all other modules.
  preload: []
}


// The flag for test environment. Such code will be removed when building.
var TEST_MODE = true

if (TEST_MODE) {
  var test = seajs.test = {}
}

