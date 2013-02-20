
module.exports = function(grunt) {


  grunt.initConfig({

    pkg: grunt.file.readJSON("package.json"),

    concat: {
      seajs: {
        src: [
          "src/intro.js",
          "src/sea.js",

          "src/util-lang.js",
          "src/util-log.js",
          "src/util-events.js",
          "src/util-path.js",
          "src/util-request.js",
          "src/util-deps.js",

          "src/module.js",
          "src/config.js",
          "src/bootstrap.js",

          "src/outro.js"
        ],
        dest: "dist/sea-debug.js"
      }
    },

    gcc: {
      seajs: {
        src: "dist/sea-debug.js",
        dest: "dist/sea.js",
        options: {
          banner: "/*! SeaJS <%= pkg.version %> | seajs.org/LICENSE.md */",

          compilation_level: "SIMPLE_OPTIMIZATIONS",
          externs: "tools/extern.js",

          warning_level: "VERBOSE",
          jscomp_off: "checkTypes",
          jscomp_error: "checkDebuggerStatement",

          source_map_format: "V3",
          create_source_map: "dist/sea.js.map"
        }
      },

      plugins: {
        src: "src/plugins/*.js",
        dest: "",
        options: {
          compilation_level: "SIMPLE_OPTIMIZATIONS",
          externs: "tools/extern.js",

          warning_level: "VERBOSE",
          jscomp_off: "checkTypes",
          jscomp_error: "checkDebuggerStatement"
        }
      }
    }

  })


  grunt.registerTask("embed", "Embed version etc.", function() {
    var filepath = "dist/sea-debug.js"
    var version = grunt.config("pkg.version")

    var code = grunt.file.read(filepath)
    code = code.replace(/@VERSION/g, version)
    grunt.file.write(filepath, code)

    grunt.log.writeln("@VERSION is replaced to \"" + version + "\".")
  })


  grunt.registerTask("fix", "Fix sourceMap etc.", function() {
    var mapfile = "dist/sea.js.map"
    var minfile = "dist/sea.js"

    var code = grunt.file.read(mapfile)
    code = code.replace('"file":""', '"file":"sea.js"')
    code = code.replace("dist/sea-debug.js", "sea-debug.js")
    grunt.file.write(mapfile, code)
    grunt.log.writeln('"' + mapfile + '" is fixed.')

    code = grunt.file.read(minfile)
    code += "//@ sourceMappingURL=sea.js.map\n"
    grunt.file.write(minfile, code)
    grunt.log.writeln('"' + minfile + '" is fixed.')
  })


  grunt.loadNpmTasks("grunt-contrib-concat")
  grunt.loadNpmTasks("grunt-gcc")

  grunt.registerTask("default", ["concat", "embed", "gcc:seajs", "fix"])
  grunt.registerTask("plugins", ["gcc:plugins"])
  grunt.registerTask("all", ["default", "gcc:plugins"])

}

