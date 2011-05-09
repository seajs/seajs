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


exports.isAbsoluteId = function(id) {
  return id.indexOf("/") === 0 ||
      id.indexOf("://") !== -1 ||
      id.indexOf(":\\") !== -1;
};


exports.isRelativeId = function(id) {
  return id.indexOf("./") === 0 || id.indexOf("../") === 0;
};


exports.isTopLevelId = function(id) {
  return !this.isAbsoluteId(id) && !this.isRelativeId(id);
};


exports.normalize = function(p, basedir) {
  if (!basedir) {
    basedir = process.cwd();
  }

  if (p == "*.js") {
    p = basedir;
  }
  else if (!this.isAbsoluteId(p)) {
    p = path.join(basedir, p);
  }

  if (!path.existsSync(p)) {
    p += ".js";
    if (!path.existsSync(p)) {
      throw "This file or directory doesn't exist: " + p;
    }
  }

  return p;
};
