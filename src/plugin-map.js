
/**
 * @fileoverview The map plugin for auto responder.
 */

define(function() {

  var config = getConfig();

  // Once load this file, set debug to true.
  config.debug = 1;
  saveConfig(config);

  // Load the map file
  if (config.map) {
    seajs._data.preloadMods.push(config.map);
  }

  createConsole(config.map);


  function createConsole(mapfile) {
    var html = '<div style="position: absolute; bottom: 10px; right: 10px;';
    html += 'z-index: 999999999; border: 2px solid #000;';
    html += 'background: #fff; color: #000; font: 12px arial;';
    html += 'padding: 0 10px 10px;">';

    html += '<span style="';
    html += 'display: block; position: absolute; top: 0; right: 0;';
    html += 'font-weight: bold; color: #fff; background: #c00; padding: 2px;';
    html += 'width: 11px; height: 12px; line-height: 12px; text-align: center;';
    html += 'cursor: pointer;';
    html += '">X</span>';

    html += '<h3 style="margin: 3px 0 10px -6px; padding: 0; font-weight: bold';
    html += '">SeaJS Map Console</h3>';

    html += '<label>Map file: <input style="';
    html += 'width: 300px; margin: 0 10px;';
    html += '" value="' + mapfile + '"></label>';
    html += '<button>Refresh</button>';

    html += '</div>';

    var div = document.createElement('div');
    div.innerHTML = html;
    document.body.appendChild(div);

    // close button
    div.getElementsByTagName('span')[0].onclick = function() {
      config.debug = 0;
      saveConfig(config);
      document.body.removeChild(div);
    };

    // refresh button
    div.getElementsByTagName('button')[0].onclick = function() {
      config.map = div.getElementsByTagName('input')[0].value;
      saveConfig(config);
      window.location.reload();
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
      map: parts[1] || ''
    };
  }

  function saveConfig(o) {
    var date = new Date();
    date.setTime(date.getTime() + 30 * 86400000); // 30 days

    document.cookie = 'seajs=' + o.debug + '`' + o.map +
        '; expires=' + date.toUTCString();
  }

});
