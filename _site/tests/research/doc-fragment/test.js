test.print('----- Script BEGIN -----')


var Z = 'script-z'

assertV('X', 'x')
assertV('Y', undefined)
assertV('Z', 'script-z')

test.assert(window.X === 'x', 'window.X = ' + window.X)
test.assert(window.Y === undefined, 'window.Y = ' + window.Y)

test.assert(this === window, 'this === window is ' + (this === window))
test.assert(this !== container, 'this === container is ' + (this === container))

//for(var k in this) print('this[' + k + '] = ' + this[k])
test.print('this.nodeType = ' + this.nodeType)


test.print('----- Script END -----')
