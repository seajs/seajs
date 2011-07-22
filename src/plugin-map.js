
/**
 * @fileoverview The map plugin for auto responder.
 */

define(function() {

  var config = getConfig();
  var loc = this.location;

  // Force debug to true when load via ?seajs-debug.
  if (loc.search.indexOf('seajs-debug') !== -1) {
    config.debug = 1;
    config.console = 1;
    saveConfig(config);
  }

  // Load the map file
  if (config.map) {
    document.title = '[debug] - ' + document.title;
    seajs._data.preloadMods.push(config.map);
  }

  // Display console
  if (config.console) {
    displayConsole(config.map);
  }

  function displayConsole(mapfile) {
    var style =
        '#seajs-debug-console { ' +
        '  position: fixed; bottom: 10px; right: 10px; z-index: 999999999;' +
        '  background: #fff; color: #000; font: 12px arial;' +
        '  border: 2px solid #000; padding: 0 10px 10px;' +
        '}' +
        '#seajs-debug-console h3 {' +
        '  margin: 3px 0 6px -6px; padding: 0;' +
        '  font-weight: bold; font-size: 14px;' +
        '}' +
        '#seajs-debug-console input {' +
        '  width: 300px; margin-left: 10px;' +
        '}' +
        '#seajs-debug-console button {' +
        '  float: right; margin: 6px 0 0 10px;' +
        '  padding: 2px 10px;' +
        '  color: #211922; background: #f9f9f9;' +
        '  background-image: -webkit-linear-gradient(top, #fefeff, #efefef);' +
        '  background-image: -moz-linear-gradient(top, #fefeff, #efefef);' +
        '  text-shadow: 0 1px #eaeaea;' +
        '  border: 1px solid #bbb;' +
        '  border-radius: 3px;' +
        '  cursor: pointer; opacity: .8' +
        '}' +
        '#seajs-debug-console button:hover {' +
        '  background: #e8e8e8; text-shadow: none; opacity: 1' +
        '}' +
        '#seajs-debug-console a {' +
        '  position: relative; top: 10px; text-decoration: none;' +
        '}';

    var html =
        '<style>' + style + '</style>' +
        '<div id="seajs-debug-console">' +
        '  <h3>SeaJS Debug Console</h3>' +
        '  <label>Map file: <input value="' + mapfile + '"/></label><br/>' +
        '  <button>Exit</button>' +
        '  <button>Hide</button>' +
        '  <button>Refresh</button>' +
        '  <a href="http://seajs.com/docs/appendix-map-plugin.html"' +
        ' target="_blank">help</a>' +
        '</div>';

    var div = document.createElement('div');
    div.innerHTML = html;
    document.body.appendChild(div);

    var buttons = div.getElementsByTagName('button');

    // hide
    buttons[1].onclick = function() {
      config.console = 0;
      saveConfig(config);
      loc.replace(loc.href.replace(/(?:\?|&)seajs-debug/, ''));
    };

    // refresh
    buttons[2].onclick = function() {
      var link = div.getElementsByTagName('input')[0].value;
      if (link.indexOf('://') === -1) {
        link = 'http://' + link;
      }

      config.map = link;
      saveConfig(config);
      loc.reload();
    };

    // exit debug mode
    buttons[0].onclick = function() {
      config.debug = 0;
      saveConfig(config);
      loc.replace(loc.href.replace(/(?:\?|&)seajs-debug/, ''));
    };
  }

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

});
