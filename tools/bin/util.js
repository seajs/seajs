// utils for sbuild

var fs = require("fs");
var path = require("path");


exports.rmdirForce = function(dir) {
  fs.readdirSync(dir).forEach(function(file) {
    var p = path.join(dir, file);
    if (fs.statSync(p).isFile()) {
      fs.unlinkSync(p);
    } else {
      rm(p);
    }
  });
  fs.rmdirSync(dir);
};


exports.mkdirSilent = function(dir) {
if (!path.existsSync(dir)) {
    fs.mkdirSync(dir, '0766');
  }
};


exports.getRelativePath = function(filepath) {
  var basedir = process.cwd();
  if (filepath.indexOf(basedir) == 0) {
    filepath = filepath.replace(basedir + "/", "");
  }
  return filepath;
};
