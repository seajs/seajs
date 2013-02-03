
var count = 0

function done(test) {
  if (++count === 3) {
    test.next()
  }
}


var preloadConfig = seajs.config.data.preload

seajs.config({
  preload: ['./preload/a']
})

var lenBeforeUse = preloadConfig.length

seajs.use(['../../test'], function(test) {
  test.assert(lenBeforeUse === 1, lenBeforeUse)
  test.assert(preloadConfig.length === 0, preloadConfig.length)
  test.assert(this.A === 'a', 'preload a.js')
  done(test)
})

seajs.config({
  preload: ['./preload/b']
})

seajs.use(['../../test'], function(test) {
  test.assert(preloadConfig.length === 0, preloadConfig.length)
  test.assert(this.B === 'b', 'preload b.js')
  done(test)
})


seajs.config({
  preload: [
    [].map ? '' : './preload/es5-safe',
    this.JSON ? '' : './preload/json2'
  ]
})

seajs.use(['../../test'], function(test) {
  test.assert([].map, 'preload es5-safe')
  test.assert(this.JSON, 'preload json2')
  done(test)
});

