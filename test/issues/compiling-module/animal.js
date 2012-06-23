define(function(require) {

  var oo = require('./oo')


  function Animal() {
  }

  oo.inherits(Animal, Object)

  Animal.prototype.isAnimal = true
  return Animal

})
