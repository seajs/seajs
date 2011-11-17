function complete(s) {
  if (self.top != self && ~location.host.indexOf('.com')) {
    req(s);
  }
  else {
    print(s);
  }
}

function req(s) {
  s += location.href.charAt(location.href.length - 1); // UA
  var img = new Image();
  img.src = 'http://stats.tudou.com/e/tmp/a10/?v=1&s=16015||||||' + s + '|||';
}

function print(txt) {
  var d = document.createElement('div');
  d.innerHTML = txt;
  document.getElementById('o').appendChild(d);
}

if (typeof scriptsNum == 'number') scriptsNum++;
