
var count = 0

function done(test) {
  if (++count === 2) {
    test.done()
  }
}


var preloadConfig = seajs.config.data.preload

seajs.config({
  preload: ['./specs/config-preload/a']
})

var lenBeforeUse = preloadConfig.length

seajs.use(['./test'], function(test) {
  test.assert(lenBeforeUse === 1, lenBeforeUse)
  test.assert(preloadConfig.length === 0, preloadConfig.length)
  test.assert(this.A === 'a', 'preload a.js')
  done(test)
})

seajs.config({
  preload: ['./specs/config-preload/b']
})

seajs.use(['./test'], function(test) {
  test.assert(preloadConfig.length === 0, preloadConfig.length)
  test.assert(this.B === 'b', 'preload b.js')
  done(test)
});

