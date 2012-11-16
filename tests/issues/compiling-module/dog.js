define(function(require) {

  var oo = require('./oo')
  var Animal = require('./animal')


  function Dog() {
  }

  oo.inherits(Dog, Animal)

  Dog.prototype.isDog = true
  return Dog

})
