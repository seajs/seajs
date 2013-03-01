/**
 * Enable to load `sea.js` self asynchronously
 */
(function(seajs) {

  var _seajs = seajs._seajs

  if (_seajs && _seajs.args) {
    var methods = ["define", "config", "use"]
    var args = _seajs.args
    for (var g = 0; g < args.length; g += 2) {
      seajs[methods[args[g]]].apply(seajs, args[g + 1])
    }
  }

})(seajs);

/*
 ;(function(m, o, d, u, l, a, r) {
 if(m[o]) return
 function f(n) { return function() { r.push(n, arguments); return a } }
 m[o] = a = { args: (r = []), config: f(1), use: f(2) }
 m.define = f(0)
 u = d.createElement("script")
 u.id = o + "node"
 u.async = true
 u.src = "path/to/sea.js"
 l = d.getElementsByTagName("head")[0]
 l.appendChild(u)
 })(window, "seajs", document);
 */

