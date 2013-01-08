
var debugInitialValue = seajs.debug

seajs.config({
  debug: true
})


var noCachePrefix = 'seajs-ts='
var noCacheTimeStamp = noCachePrefix + new Date().getTime()

// 在 fetch 时加时间戳
seajs.on('fetch', function(data) {
  var url = data.uri
  if (url.indexOf(noCachePrefix) === -1) {
    url += (url.indexOf('?') === -1 ? '?' : '&') + noCacheTimeStamp
  }
  data.uri = url
})

// 在自动获取到 uri 时去掉时间戳
seajs.on('derived', function(data) {
  var url = data.uri
  if (url.indexOf(noCachePrefix) !== -1) {
    url = url.replace(noCachePrefix + noCacheTimeStamp, '')
  }
  data.uri = url
})


define(function(require) {

  var test = require('../../test');

  var a = require('./a');
  var b = require('./b');
  var c = require('./c');
  var d = require('./d');

  var timestamp = (new Date().getTime() + '').substring(0, 8);

  test.assert(debugInitialValue === false, 'initial debug value is false');
  test.assert(seajs.debug === true, 'seajs.debug should be true');
  test.assert(a.uri.indexOf(timestamp) === -1, a.uri);
  test.assert(b.uri.indexOf(timestamp) === -1, b.uri);
  test.assert(c.uri.indexOf(timestamp) === -1, c.uri);
  test.assert(d.uri.indexOf(timestamp) === -1, d.uri);


  var scripts = document.getElementsByTagName('script');
  for (var i = 0; i < scripts.length; i++) {
    var src = scripts[i].src;
    if (src && /\/debug\/\w\.js/.test(src)) {
      test.assert(src.indexOf(timestamp) > 0, src);
    }
  }

  test.done();
});
