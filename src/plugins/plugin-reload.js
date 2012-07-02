define('seajs/plugin-reload', ['socketio'], function(require) {
  var io = require('socketio')

  // decide the server port
  var socket = io.connect('http://localhost:8964')
  socket.on('reload', function(data) {
    // TODO refresh the give path
    location.reload()
  })
});
