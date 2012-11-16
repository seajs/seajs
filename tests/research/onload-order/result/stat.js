// test page: http://js.tudouui.com/js/events/onload2/index.html

var fs = require('fs')

const UA = {
  'f': 'firefox',
  's': 'safari',
  'o': 'opera',
  'x': 'unknown',
  '1': 'ie10',
  '6': 'ie6',
  '7': 'ie7',
  '8': 'ie8',
  '9': 'ie9'
}

const ERR = [0, 8, 16]

var data = { error: [] }

Object.keys(UA).forEach(function(u) {
  var o = {}
  ERR.forEach(function(code) {
    o[code] = { total: 0, data: [] }
  })
  data[UA[u]] = o
})


fs.readFileSync('data.txt', 'utf8').split('\n').forEach(function(line) {
  // line = 24aBCAbc6	2
  var parts = line.split('\t')

  var m = parts[0].match(/^([0-9]+)([a-zA-Z]+)(\w)$/)
  if (!m) {
    data.error.push(line)
    return
  }

  var n = parseInt(parts[1])
  //var e = parseInt(m[1])
  var s = m[2]
  var v = s + '\t' + n
  var u = UA[m[3]] || UA['x']

  // 有两个 C 时，去除第一个 C
  if (s.indexOf('C') !== s.lastIndexOf('C')) {
    s = s.replace('C', '')
  }

  // onload 抢先
  if (s.indexOf('a') >= 0 && s.indexOf('a') < s.indexOf('A') ||
      s.indexOf('b') >= 0 && s.indexOf('b') < s.indexOf('B') ||
      s.indexOf('c') >= 0 && s.indexOf('c') < s.indexOf('C')) {
    save(16)
  }

  var L = s.replace(/[A-C]/g, '')
  var U = s.replace(/[a-c]/g, '').toLowerCase()

  var S1 = L, S2 = U
  if (L.length > U.length) {
    S1 = U
    S2 = L
  }

  // order 顺序与 exec 顺序不一致
  // S1 = ab, S2 = cbad
  // /a.*b/.test(cbad)
  if (!new RegExp(S1.split('').join('.*')).test(S2)) {
    save(8)
  }
  // 其他情况都认为是正确的
  else {
    save(0)
  }

  function save(code) {
    data[u][code].total += n
    data[u][code].data.unshift(v)
  }

})


// calc percent
Object.keys(UA).forEach(function(k) {
  var u = UA[k]

  data[u].total = 0
  ERR.forEach(function(code) {
    data[u].total += data[u][code].total
  })

  ERR.forEach(function(code) {
    data[u][code].percent = (data[u][code].total / data[u].total) * 100 + '%'
  })
})


console.dir(data)


var out = ''

Object.keys(UA).forEach(function(k) {
  var u = UA[k]
  var d = ''

  out += '\n------- ' + u + ' -------\n\n'
  out += '  total\t\t' + data[u].total + '\n'

  ERR.forEach(function(code) {
    var total = data[u][code].total
    out += '  ' + code + '\t\t' + total + '\t\t' + data[u][code]['percent'] + '\n'
    d += '\n  code = ' + code + ':\t' + total + '\n    '
    d += data[u][code].data.join('\n    ') + '\n'
  })

  out += d + '\n\n'
})

fs.writeFileSync('stat.txt', out, 'utf8')
