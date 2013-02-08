if (this.cacheScript) {
  print('d.js is cached')
}
else {
  print('d.js is executed')
  order.push('D')
  mod = { id: 'd' }
}
