if (this.cacheScript) {
  print('b.js is cached')
}
else {
  print('b.js is executed')
  order.push('B')
  mod = { id: 'b' }
}
