if (this.cacheScript) {
  print('g.js is cached')
}
else {
  print('g.js is executed')
  order.push('G')
  mod = { id: 'g' }
}
