/**
 * @preserve SeaJS v@VERSION | seajs.org/LICENSE.md
 */
(function(global, undefined) {
"use strict"

// Avoid conflicting when `sea.js` is loaded multiple times
var _seajs = global.seajs
if (_seajs && !_seajs.args) {
  return
}
