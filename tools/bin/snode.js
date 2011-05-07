
/**
 * @fileoverview Run wrapping modules in node.
 * @author lifesinger@gmail.com(Frank Wang)
 */

var path = require('path');


var inputFile = process.argv[2];

if (inputFile && inputFile.indexOf('/') !== 0) {
  inputFile = path.join(process.cwd(), inputFile);
  if(!path.existsSync(inputFile)) {
    inputFile += '.js';
  }
}

if (!inputFile || !path.existsSync(inputFile)) {
  if (inputFile) {
    console.log("Cannot find module '" + inputFile + "'");
  }
  console.log('Usage: snode filename.js');
  process.exit();
}


var fs = require('fs');
var vm = require('vm');
var SeaNode = require('./sea-node.js');

var code = fs.readFileSync(inputFile, 'utf-8');
vm.runInNewContext(code, SeaNode.createSandbox(inputFile));
