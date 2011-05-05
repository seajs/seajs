
var path = require("path");
var fs = require("fs");
var util = require("./util");


var inputFile, combo = false;

// node sbuild filename.js --combo
for (var i = 2; i < process.argv.length; i++) {
  var arg = process.argv[i];
  if (arg.indexOf("-") == -1) {
    inputFile = arg;
  }
  else if (arg == "--combo") {
    combo = true;
  }
}

if (!inputFile) {
  console.log("Usage: sbuild filename.js [--combo]");
  process.exit();
}
// node sbuild clear
else if (inputFile == "clear") {
  require("./clear").run(process.cwd());
  process.exit();
}

inputFile = path.join(process.cwd(), inputFile);

if (!path.existsSync(inputFile)) {
  throw "The input file doesn't exist. " + inputFile;
}


// node sbuild filename.js
if (!combo) {
  var outputFile = require("./extract").run(inputFile, "auto", true);
  console.log("Successfully build to " + util.getRelativePath(outputFile));
}
// node sbuild filename.js --combo
else {
  require("./combo").run(inputFile, "auto");
}
