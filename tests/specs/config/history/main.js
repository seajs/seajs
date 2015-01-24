define(function(require) {

  var test = require('../../../test')

  seajs.config({
    alias: {
      'a': 'x'
    }
  })
  seajs.config({
    alias: {
      'a': 'y'
    }
  })

  test.assert(seajs.data.history.alias.length == 2)
  test.assert(seajs.data.history.alias[0].a == 'x')
  test.assert(seajs.data.history.alias[1].a == 'y')

  seajs.config({
    map: [
      ['a', 'a1'],
      function(){return 1}
    ]
  })
  seajs.config({
    map: [
      ['b', 'b1'],
      function(){return 2}
    ]
  })

  test.assert(seajs.data.history.map.length == 2)
  test.assert(seajs.data.history.map[0].length == 2)
  test.assert(seajs.data.history.map[1].length == 2)
  test.assert(seajs.data.history.map[0][0].join(',') == 'a,a1')
  test.assert(seajs.data.history.map[0][1].toString().indexOf('return 1') > -1)
  test.assert(seajs.data.history.map[1][0].join(',') == 'b,b1')
  test.assert(seajs.data.history.map[1][1].toString().indexOf('return 2') > -1)

  seajs.config({
    combo: /reg1/
  })
  seajs.config({
    combo: /reg2/
  })

  test.assert(seajs.data.history.combo.length == 2)
  test.assert(seajs.data.history.combo[0].toString() == '/reg1/')
  test.assert(seajs.data.history.combo[1].toString() == '/reg2/')

  test.next()

})