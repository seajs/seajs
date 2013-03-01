/**
 * SeaJS v@VERSION | seajs.org/LICENSE.md
 */
(function(global, undefined) {

// Can't do this because several apps including ASP.NET trace
// the stack via arguments.caller.callee and Firefox dies if
// you try to trace through "use strict" call chains. (jquery#13335)
// Support: Firefox 18+
//"use strict"

// Avoid conflicting when `sea.js` is loaded multiple times
var _seajs = global.seajs
if (_seajs && _seajs.version) {
  return
}
