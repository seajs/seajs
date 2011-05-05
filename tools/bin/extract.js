
/**
 * @fileoverview Extracts module name and dependencies.
 * @author: lifesinger@gmail.com
 */

var fs = require("fs");
var path = require('path');
var uglifyjs = require("uglify-js");
var util = require("./util");
var BUILD = "__build";


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


function run(inputFile, outputFile, compress, baseFile) {
  var code = fs.readFileSync(inputFile, "utf-8");
  var ast = uglifyjs.parser.parse(code);

  var info = extractInfo(inputFile, ast, baseFile);
  var out = generateCode(ast, info, compress);

  if (outputFile) {
    if (outputFile == "auto") {
      outputFile = getAutoOutputPath(inputFile);
    }
    fs.writeFileSync(outputFile, out, "utf-8");
    console.log(" ... process " + util.getRelativePath(inputFile));
  } else {
    console.log(out);
  }

  return outputFile;
}


function extractInfo(inputFile, ast, baseFile) {
  var name = path.basename(inputFile, ".js");
  if (baseFile) {
    name = getRelativeName(inputFile, baseFile);
  }

  return {
    name: name,
    deps: getDependencies(ast)
  };
}


function getRelativeName(inputFile, baseFile) {
  // if baseFile is    "/path/to/abc/main.js"
  // when inputFile is "/path/to/abc/sub/a.js"
  // then name is      "./sub/a"
  // when inputFile is "path/to/xyz/c.js"
  // then name is      "../../xyz/c"
  var base = path.dirname(baseFile).split("/");

  var parts = path.dirname(inputFile).split("/");
  parts.push(path.basename(inputFile, ".js"));

  var name = [];

  for (var i = 0; i < parts.length; i++) {
    if (parts[i] != base[i]) {
      if (base[i]) {
        for (var j = i; j < parts.length; i++) {
          name.push("..");
        }
      }
      name = name.concat(parts.slice(i));
      break;
    }
  }

  return name.join("/");
}


function getDependencies(ast) {
  return getStaticDependencies(ast) || getDynamicDependencies(ast);
}


function getDynamicDependencies(ast) {
  var deps = [];

  // get dependencies
  // require('a') ==> call,name,require,string,a
  var pattern = /,call,name,require,string,([^,?]+)(?:\?|,|$)/g;
  var text = ast.toString();
  var match;
  while ((match = pattern.exec(text)) && match[1]) {
    if (deps.indexOf(match[1]) == -1) {
      deps.push(match[1]);
    }
  }

  return deps;
}


function getStaticDependencies(ast) {
  var deps = null;

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
        deps = (deps || []).concat(args[1][1].map(function(item) {
          return item[1];
        }));

      }

      break;
    }
  }

  return deps;
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
  }) + ";";
}


function getAutoOutputPath(inputFile) {
  var outputDir = path.join(path.dirname(inputFile), BUILD);
  util.mkdirSilent(outputDir);
  return path.join(outputDir, path.basename(inputFile));
}


// api
exports.run = run;
exports.getAutoOutputPath = getAutoOutputPath;
exports.getDependencies = getDependencies;
