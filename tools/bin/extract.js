
/**
 * @fileoverview Extracts module name and dependencies.
 * @author: lifesinger@gmail.com
 */

var fs = require("fs");
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

if(!inputFile) {
  console.log('Usage: extract --input a.js --output out.js');
  process.exit();
}


var code = fs.readFileSync(inputFile, "utf-8");
var ast = uglifyjs.parser.parse(code);

var info = extractInfo(ast);
var out = generateCode(ast, info);

if (outputFile) {
  fs.writeFileSync(outputFile, out, "utf-8");
} else {
  console.log(out);
}


function extractInfo(ast) {
  // get module name
  var name = require('path').basename(inputFile, ".js");

  // get dependencies
  // require('a') ==> call,name,require,string,a
  var pattern = /,call,name,require,string,([^,]+),|$/g;
  var text = ast.toString();
  var deps = [];
  var match;
  while((match = pattern.exec(text)) && match[1]) {
    deps.push(match[1]);
  }

  return {
    name: name,
    deps: deps
  };
}


function generateCode(ast, info) {
  // ast: [ 'toplevel', [ [ 'stat', [Object] ], [ 'stat', [Object], ... ] ] ]
  var stats = ast[1];

  for(var i = 0; i < stats.length; i++) {
    // [ 'stat', [ 'call', [ 'name', 'define' ], [ [Object] ] ] ]
    var stat = stats[i];

    if(stat.toString()
        .indexOf('stat,call,name,define,function,,') == 0) {

      // stat[1]:
      //     [ 'call',
      //       [ 'name', 'define' ],
      //       [ [ 'function', null, [Object], [Object] ] ] ]
      var args = stat[1][2];

      args.unshift(['array', info.deps.map(function(item) {
        return ['string', item];
      })]);

      args.unshift(['string', info.name]);

      // only process first "define"
      break;
    }
  }

  return uglifyjs.uglify.gen_code(ast);
}
