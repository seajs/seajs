if (this.cacheScript) {
  print('f.js is cached')
}
else {
  print('f.js is executed')
  out.push('F')

  fetch('c.js', printOnload('c.js'))
}
