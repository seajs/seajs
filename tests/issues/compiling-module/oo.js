define(function(require, exports, module) {

  var Module = module.constructor


  exports.inherits = function(ctor, superCtor) {

    ctor.prototype = createProto(superCtor.prototype)

    // Adds meta info
    var compilingModule = Module._getCompilingModule()
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


  // Shared empty constructor function to aid in prototype-chain creation.
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
