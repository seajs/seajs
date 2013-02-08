if (this.cacheScript) {
  print('i.js is cached')
}
else {
  print('i.js is executed')
  order.push('I')
  mod = { id: 'i' }
}
