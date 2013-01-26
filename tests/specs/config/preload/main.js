
var count = 0

function done(test) {
  if (++count === 2) {
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
});

