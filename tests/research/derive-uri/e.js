if (this.cacheScript) {
  print('e.js is cached')
}
else {
  print('e.js is executed')
  order.push('E')
  mod = { id: 'e' }
}
