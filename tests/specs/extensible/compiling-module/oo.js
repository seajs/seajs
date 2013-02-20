(function() {

var compilingStack = []

seajs.on('compile', function(mod) {
  compilingStack.push(mod)
})

seajs.on('compiled', function() {
  compilingStack.pop()
})


define(function(require, exports) {

  exports.inherits = function(ctor, superCtor) {

    ctor.prototype = createProto(superCtor.prototype)

    // Add meta info
    var compilingModule = compilingStack[compilingStack.length - 1]
    var filename = compilingModule.uri.split(/[\/\\]/).pop()

    if (Object.defineProperties) {
      Object.defineProperties(ctor.prototype, {
        __module: { value: compilingModule },
        __filename: { value:  filename }
      })
    }
    else {
      ctor.prototype.__module = compilingModule
      ctor.prototype.__filename = filename
    }
  }


  // Shared empty constructor function to aid in prototype-chain creation
  function Ctor() {
  }

  // See: http://jsperf.com/object-create-vs-new-ctor
  var createProto = Object.__proto__ ?
      function(proto) {
        return { __proto__: proto }
      } :
      function(proto) {
        Ctor.prototype = proto
        return new Ctor()
      }

})

})();

