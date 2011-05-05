
/**
 * @fileoverview Extracts module name and dependencies.
 * @author: lifesinger@gmail.com
 */

var fs = require("fs");
var path = require('path');
var uglifyjs = require("uglify-js");


// call directly
if (__filename == process.argv[1]) {
  var inputFile, outputFile, compress;

  // node extract.js --input a.js --output b.js --compress
  for (var i = 2; i < process.argv.length; i++) {
    var name = process.argv[i];
    if (name == "--input") {
      inputFile = process.argv[++i];
    }
    else if (name == "--output") {
      outputFile = process.argv[++i];
    }
  }

  compress = process.argv.indexOf("--compress") != -1;

  if (!inputFile) {
    console.log("Usage: node extract --input a.js [--output out.js] [--compress]");
    process.exit();
  }

  run(inputFile, outputFile, compress);
  process.exit();
}


function run(inputFile, outputFile, compress) {
  var code = fs.readFileSync(inputFile, "utf-8");
  var ast = uglifyjs.parser.parse(code);

  var info = extractInfo(inputFile, ast);
  var out = generateCode(ast, info, compress);

  if (outputFile) {
    fs.writeFileSync(outputFile, out, "utf-8");
  } else {
    console.log(out);
  }
}


function extractInfo(inputFile, ast) {
  // get module name
  var name = path.basename(inputFile, ".js");

  // get dependencies
  // require('a') ==> call,name,require,string,a
  var pattern = /,call,name,require,string,([^,]+),|$/g;
  var text = ast.toString();
  var deps = [];
  var match;
  while ((match = pattern.exec(text)) && match[1]) {
    deps.push(match[1]);
  }

  return {
    name: name,
    deps: deps
  };
}


function generateCode(ast, info, compress) {
  // ast: [ 'toplevel', [ [ 'stat', [Object] ], [ 'stat', [Object], ... ] ] ]
  var stats = ast[1];

  for (var i = 0; i < stats.length; i++) {
    // [ 'stat', [ 'call', [ 'name', 'define' ], [ [Object] ] ] ]
    var stat = stats[i];

    if (stat.toString()
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

  var pro = uglifyjs.uglify;

  if(compress) {
    ast = pro.ast_mangle(ast);
    ast = pro.ast_squeeze(ast);
  }
  
  return pro.gen_code(ast, {
    beautify: !compress,
    indent_level: 2
  });
}


exports.run = run;
