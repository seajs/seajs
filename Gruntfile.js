
module.exports = function(grunt) {

  var path = require("path")


  grunt.initConfig({
    pkg: grunt.file.readJSON("package.json"),

    concat: {
      dist: {
        src: [
          "src/intro.js",
          "src/sea.js",
          "src/util-lang.js",
          "src/util-events.js",
          "src/util-path.js",
          "src/util-request.js",
          "src/util-deps.js",
          "src/module.js",
          "src/config.js",
          "src/outro.js"
        ],
        dest: 'dist/sea-debug.js'
      }
    },

    uglify: {
      all: {
        files: {
          "dist/sea.js": ["dist/sea-debug.js"]
        },
        options: {
          banner: "/*! Sea.js <%= pkg.version %> | seajs.org/LICENSE.md\n" +
              "//@ sourceMappingURL=sea.js.map\n*/\n",
          sourceMap: "dist/sea.js.map",
          sourceMappingURL: "sea.js.map",
          //report: "gzip",
          compress: {
            unsafe: true,
            unused: false
          },
          mangle: {
          }
        }
      }
    }
  })


  // Replace @VERSION tokens to real values
  grunt.registerTask("post-concat", function() {
    var filepath = "dist/sea-debug.js"
    var version = grunt.config("pkg.version")

    var code = grunt.file.read(filepath)
    code = code.replace(/@VERSION/g, version)
    grunt.file.write(filepath, code)

    grunt.log.writeln('"@VERSION" is replaced to "' + version + '".')
  })

  // Fix sourceMap after compressing
  grunt.registerTask("post-uglify", "Fix sourceMap etc.", function() {
    var mapfile = "dist/sea.js.map"

    var code = grunt.file.read(mapfile)
    code = code.replace('"file":"dist/sea.js"', '"file":"sea.js"')
    code = code.replace("dist/sea-debug.js", "sea-debug.js")
    grunt.file.write(mapfile, code)
    grunt.log.writeln('"' + mapfile + '" is fixed.')

    var minfile = "dist/sea.js"
    code = grunt.file.read(minfile)
    code = code.replace(/\/\*\n\/\/@ sourceMappingURL=sea\.js\.map\n\*\//, "")
    grunt.file.write(minfile, code)
    grunt.log.writeln('"' + minfile + '" is fixed.')
  })


  // Load grunt tasks from NPM packages
  grunt.loadNpmTasks("grunt-contrib-concat")
  grunt.loadNpmTasks("grunt-contrib-uglify")


  grunt.registerTask("default",
      ["concat", "post-concat", "uglify", "post-uglify"])

}

