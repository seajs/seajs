/**
 * @preserve SeaJS - A Module Loader for the Web
 * v@VERSION | seajs.org | MIT Licensed
 */
(function(global, undefined) {
"use strict"

// Avoid conflicting when `sea.js` is loaded multiple times
if (global.seajs) {
  return
}

