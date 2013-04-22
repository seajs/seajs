var fs = require('fs');
var http = require('http');
var print = require('util').print;
var spawn = require('child_process').spawn;
var static = require('node-static');

function createServer(dir, cmd) {
  dir = dir || '.';

  // Server Start
  var file = new static.Server(fs.realpathSync(dir));

  var server = http.createServer(function(request, response) {
    request.addListener('end', function() {
      file.serve(request, response);
    }).resume();
  });

  server.listen(9012, function() {
    if (cmd) {
      var args = cmd.split(' ');
      args = args.map(function(arg) {
        return arg.trim();
      });
      args = args.filter(function(arg) {
        return arg.length;
      });
      var runner = spawn(args[0], args.slice(1));
      runner.stdout.on('data', function(data) {
        print(data.valueOf());
      });
      runner.on('exit', function(code) {
        if (code === 127) {
          print(cmd + ' not available');
        }
        server.close();
        process.exit(code);
      });
    }
  });
}

var dir = process.argv[2] || '.';
var cmd = process.argv.slice(3);
createServer(dir, cmd.join(' '));
