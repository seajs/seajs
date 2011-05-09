
var path = require("path");
var fs = require("fs");
var util = require("./util");
var extract = require("./extract");
var combo = require("./combo");


var inputArgs = [];
var isCombo = false;
var comboAll = false;
var isRecursive = false;

// node sbuild [--combo] [-r] a.js b.js
for (var i = 2; i < process.argv.length; i++) {
  var arg = process.argv[i];
  if (arg === "--combo") {
    isCombo = true;
    if (process.argv[++i] === "all") {
      comboAll = true;
    }
  }
  else if (arg === "-r") {
    isRecursive = true;
  }
  else {
    inputArgs.push(arg);
  }
}


var first = inputArgs[0];
if (!first || /^(?:--help|help|\?)$/.test(first)) {
  console.log("Usage:");
  console.log("  sbuild a.js [--combo [all]]");
  console.log("  sbuild a.js b.js [--combo [all]]");
  console.log("  sbuild *.js [--combo [all]]");
  console.log("  sbuild some_directory [--combo [all]] [-r]");
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

    var p = util.normalize(name, basedir);
    var stat = fs.statSync(p);

    if (name.indexOf(".") !== 0 && stat.isFile()) {
      buildFile(p);
    }
    else if ((first || isRecursive) &&
        name !== "__build" &&
        stat.isDirectory()) {
      build(fs.readdirSync(p), p);
    }

  });
}


function buildFile(filepath) {
  if (isCombo) {
    combo.run(filepath, "auto", comboAll);
  } else {
    var outfile = extract.run(filepath, "auto", true);
    console.log("Successfully build to " + util.getRelativePath(outfile));
  }
}
