
/**
 * @fileoverview Combine module and its relative dependencies to one file.
 * @author: lifesinger@gmail.com
 */

var fs = require("fs");
var path = require("path");
var uglifyjs = require("uglify-js");
var extract = require("./extract");
var util = require("./util");
var COMBO_DIR = "__combo_tmp";


exports.run = function(inputFile, outputFile) {
  var files = [];
  getAllRelativeDependencies(inputFile, files);

  var tmpdir = path.join(path.dirname(inputFile), COMBO_DIR);
  util.mkdirSilent(tmpdir);

  var extractedFiles = files.map(function(file) {
    var t = path.join(tmpdir, path.basename(file));
    extract.run(file, t, true, inputFile);
    return t;
  });

  var out = getComboCode(extractedFiles);

  if (outputFile) {
    if (outputFile == "auto") {
      outputFile = extract.getAutoOutputPath(inputFile);
    }
    fs.writeFileSync(outputFile, out, "utf-8");
    console.log("Successfully combo to " + util.getRelativePath(outputFile));
  } else {
    console.log(out);
  }

  util.rmdirForce(tmpdir);

  return outputFile;
};


function getAllRelativeDependencies(filepath, ret) {
  ret.push(filepath);

  var basedir = path.dirname(filepath);
  var deps = getDependencies(filepath);

  deps.forEach(function(dep) {
    if (isRelativePath(dep)) {
      var p = path.join(basedir, dep);

      if (!path.existsSync(p)) {
        p += ".js";
        if (!path.existsSync(p)) {
          throw "This file doesn't exist: " + p;
        }
      }

      if(ret.indexOf(p) == -1) {
        getAllRelativeDependencies(p, ret);
      }
    }
  });
  
  return ret;
}


function getDependencies(filepath) {
  var code = fs.readFileSync(filepath, "utf-8");
  var ast = uglifyjs.parser.parse(code);
  return extract.getDependencies(ast);
}


function isRelativePath(path) {
  return path.indexOf("./") == 0 || path.indexOf("../") == 0;
}


function getComboCode(files) {
  return files.map(
      function(file) {
        return fs.readFileSync(file, "utf-8");
      }).join("\n");
}
