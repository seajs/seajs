if (this.cacheScript) {
  print('f.js is cached')
}
else {
  print('f.js is executed')
  fetch('c.js', printOnload('c.js'))

  order.push('F')
  mod = { id: 'f' }
}
