
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
          banner: "/*! Sea.js <%= pkg.version %> | seajs.org/LICENSE.md */\n",
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


  grunt.registerTask("post-concat", function() {
    var filepath = "dist/sea-debug.js"
    var version = grunt.config("pkg.version")

    var code = grunt.file.read(filepath)
    code = code.replace(/@VERSION/g, version)
    grunt.file.write(filepath, code)

    grunt.log.writeln('"@VERSION" is replaced to "' + version + '".')
  })

  grunt.registerTask("post-uglify", function() {
    var minfile = "dist/sea.js"

    var code = grunt.file.read(minfile)
    code += "\n"
    grunt.file.write(minfile, code)

    grunt.log.writeln('File "' + minfile + '" fixed.')
  })


  // Load grunt tasks from NPM packages
  grunt.loadNpmTasks("grunt-contrib-concat")
  grunt.loadNpmTasks("grunt-contrib-uglify")


  grunt.registerTask("default",
      ["concat", "post-concat", "uglify", "post-uglify"])

}

