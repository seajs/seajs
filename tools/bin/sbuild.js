
var path = require("path");
var fs = require("fs");


var inputFile, combo = false;

// node sbuild.js filename.js --combo
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

inputFile = path.join(process.cwd(), inputFile);

if (!path.existsSync(inputFile)) {
  throw "The input file doesn't exist. " + inputFile;
}

var outputDir = path.join(
    path.dirname(inputFile),
    "__build"
    );

var outputFile = path.join(
    outputDir,
    path.basename(inputFile)
    );

if (!path.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, '0766');
}


require("./extract").run(inputFile, outputFile, true);

