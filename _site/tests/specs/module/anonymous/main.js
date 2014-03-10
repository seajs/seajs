
seajs.use('../../test', function(test) {

  // anonymous before anonymous
  define(function() { return { name: 'x' } })

  seajs.use('./anonymous/a', function(a) {
    test.assert(a.name === 'a', a.name)

    // anonymous before specific
    define({ name: 'x2' })

    seajs.use('./anonymous/b', function(b) {
      test.assert(b.name === 'b', b.name)

      // anonymous and specific modules in one file
      seajs.use('./anonymous/c', function(c) {
        seajs.use('./anonymous/c2', function(c2) {

          // In IE6-9, c.name is `c0`
          test.assert(c.name === 'c' || c.name === 'c0', c.name)
          test.assert(c2.name === 'c2', c2.name)

          // define anonymous before a module which uri is un-matched with script src
          define({ name: 'd-from-page' })
          seajs.use('./anonymous/d', function(d) {
            test.assert(d === null || // in Node.js
                d.name === 'd-from-page', // in Browsers
                'It is wrong, and I know')

            seajs.use('anonymous-d', function(d) {
              test.assert(d.name === 'anonymous-d', 'It is here')
              test.next()
            })

          })

        })
      })
    })
  })

});

