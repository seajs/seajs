
var path = require("path");
var fs = require("fs");
var util = require("./util");
var extract = require("./extract");
var combo = require("./combo");


var inputArgs = [];
var isCombo = false;
var isRecursive = false;

// node sbuild [--combo] [-r] a.js b.js
for (var i = 2; i < process.argv.length; i++) {
  var arg = process.argv[i];
  if (arg == "--combo") {
    isCombo = true;
  }
  else if (arg == "-r") {
    isRecursive = true;
  }
  else {
    inputArgs.push(arg);
  }
}


var first = inputArgs[0];
if (!first || /^(?:--help|help|\?)$/.test(first)) {
  console.log("Usage:");
  console.log("  sbuild [--combo] a.js");
  console.log("  sbuild [--combo] a.js b.js");
  console.log("  sbuild [--combo] *.js");
  console.log("  sbuild [--combo] [-r] some_directory");
  console.log("  sbuild clear");
  process.exit();
}
// sbuild clear
else if (first == "clear") {
  require("./clear").run(process.cwd());
  process.exit();
}


build(inputArgs, process.cwd(), true);
process.exit();


function build(names, basedir, first) {
  names.forEach(function(name) {

    var p = normalize(name, basedir);
    var stat = fs.statSync(p);

    if (name.indexOf(".") != 0 && stat.isFile()) {
      buildFile(p);
    }
    else if ((first || isRecursive) &&
        name != "__build" &&
        stat.isDirectory()) {
      build(fs.readdirSync(p), p);
    }

  });
}


function buildFile(filepath) {
  if (isCombo) {
    combo.run(filepath, "auto");
  } else {
    var outfile = extract.run(filepath, "auto", true);
    console.log("Successfully build to " + util.getRelativePath(outfile));
  }
}


function normalize(p, basedir) {
  if (p == "*.js") {
    p = basedir;
  }
  else if (p.indexOf("/") != 0) {
    p = path.join(basedir, p);
  }

  if (!path.existsSync(p)) {
    p += ".js";
    if (!path.existsSync(p)) {
      throw "This file or directory doesn't exist: " + p;
    }
  }

  return p;
}
