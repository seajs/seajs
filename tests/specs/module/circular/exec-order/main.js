

seajs.use(['../../test', 'a'], function(test, a) {
  a.init()

  test.assert(logStack.join('') === 'abc', logStack.join(' --> '))
  test.done()
})