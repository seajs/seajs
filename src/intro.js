/**
 * SeaJS v@VERSION | seajs.org/LICENSE.md
 */
(function(global, undefined) {

// Avoid conflicting when `sea.js` is loaded multiple times
var _seajs = global.seajs
if (_seajs && _seajs.version) {
  return
}
