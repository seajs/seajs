
/**
 * @fileoverview Combine module and its relative dependencies to one file.
 * @author: lifesinger@gmail.com
 */

var fs = require("fs");
var path = require("path");
var uglifyjs = require("uglify-js");


var inputFile, outputFile;

// node extract.js --input a.js --output b.js
for (var i = 2; i < process.argv.length; i++) {
  var name = process.argv[i];
  if (name == "--input") {
    inputFile = process.argv[++i];
  }
  else if (name == "--output") {
    outputFile = process.argv[++i];
  }
}

if (!inputFile) {
  console.log("Usage: node combo --input a.js [--output out.js]");
  process.exit();
}


var files = getAllDependencies(inputFile);
var out = getComboCode(files);

if (outputFile) {
  fs.writeFileSync(outputFile, out, "utf-8");
} else {
  console.log(out);
}
process.exit();


function getAllDependencies(filepath) {
  if(filepath.indexOf('/') != 0) {
    filepath = path.join(__dirname, filepath);
  }

  var ret = [filepath];
  var basedir = path.dirname(filepath);
  var deps = getDependencies(filepath);

  deps.forEach(function(dep) {
    if(isRelativePath(dep)) {
      var p = path.join(basedir, dep);
      if(ret.indexOf(p) != -1 && path.existsSync(p)) {
        ret = ret.concat(getAllDependencies(p));
      }
    }
  });
  
  return ret;
}


function getDependencies(filepath) {
  if(!path.existsSync(filepath)) {
    filepath += ".js";
    if(!path.existsSync(filepath)) {
      throw filepath + " does not exist.";
    }
  }

  var deps = [];
  var code = fs.readFileSync(filepath, "utf-8");
  var ast = uglifyjs.parser.parse(code);

  // ast: [ 'toplevel', [ [ 'stat', [Object] ], [ 'stat', [Object], ... ] ] ]
  var stats = ast[1];

  for (var i = 0; i < stats.length; i++) {
    // [ 'stat', [ 'call', [ 'name', 'define' ], [ [Object] ] ] ]
    var stat = stats[i];

    if (stat.toString()
        .indexOf("stat,call,name,define,") == 0) {

      // stat:
      // [ 'stat',
      //   [ 'call',
      //     [ 'name', 'define' ],
      //     [ [Object], [Object], [Object] ] ] ]
      var args = stat[1][2];

      // args:
      //    [ [ 'string', 'program' ],
      //      [ 'array', [ [Object], [Object] ] ],
      //      [ 'function', null, [ 'require' ], [] ] ]
      if(args[1] && (args[1][0] == "array")) {

        // args[1]:
        //   [ 'array', [ [ 'string', 'a' ], [ 'string', 'b' ] ] ]
        deps = deps.concat(args[1][1].map(function(item) {
          return item[1];
        }));

      }

      break;
    }
  }

  return deps;
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
