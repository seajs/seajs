
/**
 * @fileoverview Combine module and its relative dependencies to one file.
 * @author: lifesinger@gmail.com
 */

var fs = require("fs");
var path = require("path");
var uglifyjs = require("../uglify-js/uglify-js");
var extract = require("./extract");
var util = require("./util");

var COMBO_DIR = "__combo_tmp";
var seajsDir = path.join(__dirname, "../../build");


exports.run = function(inputFile, outputFile, comboAll) {
  var files = getAllDependencies(inputFile, comboAll);

  var tmpdir = path.join(path.dirname(inputFile), COMBO_DIR);
  util.mkdirSilent(tmpdir);

  var extractedFiles = files.map(function(file) {
    var ret;

    // top-level module
    if (file.indexOf(seajsDir) === 0) {
      console.log(" ... process " + path.basename(file));
      ret = file;
    }
    else {
      ret = path.join(tmpdir, path.basename(file));
      extract.run(file, ret, true, inputFile);
    }

    return ret;
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


function getAllDependencies(filepath, comboAll, ret) {
  ret = ret || [];
  if (path.extname(filepath) !== ".js") {
    return ret;
  }

  ret.push(filepath);

  var basedir = path.dirname(filepath);
  var deps = getDependencies(filepath);

  deps.forEach(function(id) {
    if (comboAll || util.isRelativeId(id)) {
      var p = id;

      if (util.isRelativeId(id)) {
        p = path.join(basedir, id);
      }
      else if (util.isTopLevelId(id)) {
        p = path.join(seajsDir, id);
      }

      if (!path.existsSync(p)) {
        p += ".js";
        if (!path.existsSync(p)) {
          throw "This file doesn't exist: " + p;
        }
      }

      if (ret.indexOf(p) === -1) {
        getAllDependencies(p, comboAll, ret);
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


function getComboCode(files) {
  return files.map(
      function(file) {
        return fs.readFileSync(file, "utf-8");
      }).join("\n");
}
