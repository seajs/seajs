
module.exports = function(grunt) {

  var path = require("path")

  const GCC_OPTIONS = {
    compilation_level: "SIMPLE_OPTIMIZATIONS",
    externs: "tools/extern.js",

    warning_level: "VERBOSE",
    jscomp_off: "checkTypes",
    jscomp_error: "checkDebuggerStatement"
  }


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
        options: grunt.util._.merge({
          banner: "/*! SeaJS <%= pkg.version %> | seajs.org/LICENSE.md */",
          source_map_format: "V3",
          create_source_map: "dist/sea.js.map"
        }, GCC_OPTIONS)
      },

      plugins: {
        files: grunt.file.expandMapping(
            "src/plugins/*.js", "dist/",
            {
              "rename": function(dest, matchedSrcPath) {
                return path.join(dest, matchedSrcPath.split("/").pop())
              }
            }
        ),
        options: GCC_OPTIONS
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


  grunt.loadTasks("tools/grunt-tasks")
  grunt.loadNpmTasks("grunt-contrib-concat")

  grunt.registerTask("default", ["concat", "embed", "gcc:seajs", "fix"])
  grunt.registerTask("plugins", ["gcc:plugins"])
  grunt.registerTask("all", ["default", "plugins"])

}

