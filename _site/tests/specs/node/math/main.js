
var test = require('../../../test')
var inc = require('./increment').increment

test.assert(inc(1) === 2, 'The result of inc(1) is 2')
test.next()

