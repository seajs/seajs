(function() {

  var config = getConfig();
  config.debug = 1;
  config.console = 1;
  saveConfig(config);
  location.reload();

  function getConfig() {
    var cookie = '', m;

    if ((m = document.cookie.match(
        /(?:^| )seajs(?:(?:=([^;]*))|;|$)/))) {
      cookie = m[1] ? decodeURIComponent(m[1]) : '';
    }

    var parts = cookie.split('`');
    return {
      debug: Number(parts[0]) || 0,
      map: parts[1] || '',
      console: Number(parts[2]) || 0
    };
  }

  function saveConfig(o) {
    var date = new Date();
    date.setTime(date.getTime() + 30 * 86400000); // 30 days

    document.cookie = 'seajs=' + o.debug + '`' + o.map + '`' + o.console +
        '; expires=' + date.toUTCString();
  }
})();