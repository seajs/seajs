/**
 * Turn on this plugin to disable cache by adding timestamp.
 */
define('seajs/plugin-nocache', [], function() {

  var noCachePrefix = 'seajs-nocache='
  var noCacheTimeStamp = noCachePrefix + new Date().getTime()


  // 在 fetch 时加时间戳
  seajs.on('fetch', function(data) {
    var url = data.uri
    if (url.indexOf(noCachePrefix) === -1) {
      url += (url.indexOf('?') === -1 ? '?' : '&') + noCacheTimeStamp
    }
    data.uri = url
  })


  // 在自动获取 uri 时去掉时间戳
  seajs.on('derived', function(data) {
    var url = data.uri
    if (url.indexOf(noCachePrefix) !== -1) {
      url = url.replace(noCachePrefix + noCacheTimeStamp, '')
    }
    data.uri = url
  })

});

