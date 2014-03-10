(function(){
/**
 * A Sea.js plugin for collecting health data of CMD modules
 */

seajs.health = function() {
  return {
    "multiVersions": getMultiVersions(),
    "circles": getCircles()
  }
}


var cachedMods = seajs.cache
var VERSION_RE = /(\/)(?:\d+\.){1,2}\d+(\/)|(\D)(?:\d+\.){1,2}\d+[^/]*(\.(?:js|css))/

// Only support version styles bellow:
// `zz/1.2.3/xx`
// `zz/xx-1.2.3-beta.js`
// `zz/xx.1.2.3.rc2.js`
function getMultiVersions() {
  var hash = {}
  var ret = {}

  for (var uri in cachedMods) {
    var m = uri.match(VERSION_RE)
    if (!m) continue

    var key = uri.replace(VERSION_RE,
        (m[1] || m[3]) + "{version}" + (m[2] || m[4]))

    var arr = hash[key] || (hash[key] = [])

    if (indexOf(arr, uri) === -1) {
      arr.push(uri)
      if (arr.length > 1) {
        ret[key] = arr
      }
    }
  }

  return ret
}


function Graph() {
  this.nodes = []
}


Graph.prototype = {
  add: function(name, data) {
    return this.getNode(name, data)
  },

  getNode: function(name, data) {
    var ns = this.nodes
    var temp = {
      name: name
    }

    for (var i = 0, len = ns.length; i < len; i++) {
      if (ns[i].equals(temp)) {
        return ns[i]
      }
    }

    var node = new Node(name)
    node.data = data
    this.nodes.push(node)
    return node
  },

  getCircleNodes: function() {
    // L <- Empty array that will contain the sorted elements
    var L = []

    // S <- Array of all nodes with no incoming edges
    var S = []

    forEach(this.nodes, function(node) {
      if (node.inEdges.length == 0) {
        S.push(node)
      }
    })

    // while S is non-empty do
    while(S.length) {

      // remove a node n from S
      var node = S.shift()

      // insert n into L
      L.push(node)

      // for each node with outEdges do
      while(node.outEdges.length) {

        // remove edge e from the node
        var e = node.outEdges.shift()
        var m = e.to

        // remove edge form m
        e.remove()

        // if m has no other incoming edges then insert m into S
        if (m.inEdges.length == 0) {
          S.push(m)
        }
      }

      // Check to see if all edges are removed
      return filter(this.nodes, function(node) {
        return node.inEdges.length != 0
      })
    }

    // Check to see if all edges are removed
    return this.nodes.filter(function(node) {
      return node.inEdges.length != 0
    })
  },

  clone: function() {
    var g = new Graph()

    this.nodes.forEach(function(node) {
      var n = g.add(node.name, node.data)
      node.outEdges.forEach(function(e) {
        var to = e.to
        n.addEdge(g.add(to.name, to.data))
      })
    })
    return g
  }
}

function Node(name) {
  this.name = name
  this.inEdges = []
  this.outEdges = []
  this.depth = 0
}

Node.prototype = {
  addEdge: function(node) {
    var e = new Edge(this, node)
    this.outEdges.push(e)
    node.inEdges.push(e)

    // When adding edges, plus 1 depth
    node.setDepth(this.depth + 1)
    return this
  },

  setDepth: function(depth) {
    if (depth < this.depth) return
    this.depth = depth
  },

  equals: function(node) {
    return node.name == this.name
  }
}

function Edge(from, to) {
  this.from = from
  this.to = to
}

Edge.prototype = {
  equals: function(edge) {
    return edge.from == this.from && edge.to == this.to
  },

  // remove incoming edge
  remove: function() {
    var toInEdges = this.to.inEdges.slice(0)
    for (var i = 0, len = toInEdges.length; i < len; i++) {
      if (toInEdges[i].equals(this)) {
        remove(this.to.inEdges, toInEdges[i])
      }
    }
  }
}


function remove(arr, item) {
  arr.splice(indexOf(arr, item), 1)
}

function printCycleNode(nodes) {
  console.info(nodes.map(function(node) {
    return node.name
  }))
}

function addDep(node, mod) {
  if (!mod) return

  forEach(mod.dependencies, function(subId) {
    var subNode = graph.add(subId)
    node.addEdge(subNode)
    addDep(subNode, cachedMods[mod.resolve(subId)])
  })
}

var graph = new Graph()

function getCircles() {
  var roots = []

  for (var key in cachedMods) {
    if (isRoot(key)) {
      var mod = cachedMods[key]
      var node = graph.add(key)
      addDep(node, mod)
    }
  }

  return {
      circles: graph.getCircleNodes(),
      nodes: graph.nodes
  }
}

// Helpers

function isRoot(id) {
  return /_use_\d+$/.test(id)
}

function forEach(arrs, cb) {
  for (var i = 0, len = arrs.length; i < len; i++) {
    cb(arrs[i], i)
  }
}

function filter(arrs, iterator) {
  var results = []
  forEach(arrs, function(value) {
    if (iterator.call(null, value)) results.push(value);
  })
  return results
}


var indexOf = [].indexOf ?
  function(arr, item) {
    return arr.indexOf(item)
  } :
  function(arr, item) {
    for (var i = 0; i < arr.length; i++) {
      if (arr[i] === item) {
        return i
      }
    }
    return -1
  }

define("seajs/seajs-health/0.1.1/seajs-health-debug", [], {});
})();