
var fs = require('fs');


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
};

const ERR = [0, 1, 2, 4, 8, 16];

var data = { error: [] };

Object.keys(UA).forEach(function(u) {
  var o = {};
  ERR.forEach(function(code) {
    o[code] = { total: 0, data: [] };
  });
  data[UA[u]] = o;
});


fs.readFileSync('data.txt', 'utf8').split('\n').forEach(function(line) {

  // line = 24aBCAbc6	2
  var parts = line.split('\t');
  var m = parts[0].match(/^([0-9]+)([a-zA-Z]+)(\w)$/);

  if (m) {
    var e = parseInt(m[1]);
    var n = parseInt(parts[1]);
    var o = m[2];
    var v = o + '\t' + n;
    var u = UA[m[3]] || UA['x'];

    if (o.indexOf('C') !== o.lastIndexOf('C')) {
      save(4);
    }
    else if (e === 0) {
      save(0);
    }
    // window.onerror
    else if (e & 1) {
      save(1);
    }
    // node.onerror
    else if (e & 2) {
      save(2);
    }
    // onload is fired before executing
    else if (o.indexOf('a') >= 0 && o.indexOf('a') < o.indexOf('A') ||
        o.indexOf('b') >= 0 && o.indexOf('b') < o.indexOf('B') ||
        o.indexOf('c') >= 0 && o.indexOf('c') < o.indexOf('C')) {
      save(16);
    }
    else {
      var L = o.replace(/[A-C]/g, '');
      var U = o.replace(/[a-c]/g, '').toLowerCase();
      var S1 = L, S2 = U;
      if (L.length > U.length) {
        S1 = U;
        S2 = L;
      }
      S2.split('').forEach(function(w) {
        if (S1.indexOf(w) === -1) {
          S2 = S2.replace(w, '');
        }
      });

      // onload order is weird
      if (S2 !== S1) {
        save(8);
      }
      // other bad cases
      else {
        save(4);
      }
    }

    function save(code) {
      data[u][code].total += n;
      data[u][code].data.push(v);
    }
  }
  else {
    data.error.push(line);
  }
  
});
console.dir(data);

var out = '';

Object.keys(UA).forEach(function(k) {
  var u = UA[k];
  var d = '';

  out += '\n------- ' + u + ' -------\n\n';

  ERR.forEach(function(code) {
    var total = data[u][code].total;
    out += '  ' + code + '\t' + total + '\n';
    d += '\n  code = ' + code + ':\t' + total + '\n    ';
    d += data[u][code].data.join('\n    ') + '\n';
  });

  out += d + '\n\n';
});

fs.writeFileSync('stat.txt', out, 'utf8');
