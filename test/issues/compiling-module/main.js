define(function(require) {

  var test = require('../../test')

  var Dog = require('./dog')
  var dog = new Dog()

  seajs.log(dog, 'dir')

  test.assert(dog.isAnimal === true, dog.isAnimal)
  test.assert(dog.isDog === true, dog.isDog)
  test.assert(dog.__filename === 'dog.js', dog.__filename)
  test.assert(dog.__module.dependencies.length === 2, dog.__module.dependencies)

  test.done()

})
