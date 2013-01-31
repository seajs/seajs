if (this['DEBUG']) {
  print('f.js is executed')
  out.push('F')

  fetch('c.js', printOnload('c.js'))
}
else {
  print('f.js is cached')
}
