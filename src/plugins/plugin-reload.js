/**
 * The reload plugin to free your finger.
 */
define('seajs/plugin-reload', [], function(require) {

  // todo

  require.async('path/to/socketio', function(io) {
    var socket = io.connect('http://localhost:8964')
    socket.on('reload', function() {
      location.reload()
    })
  })

});
