
// Forked from https://github.com/Darsain/grunt-gcc that is buggy.
// Wait time to push back.

module.exports = function(grunt) {

  var compiler = require("gcc")


  grunt.registerMultiTask("gcc", "Minify files with GCC.", function() {
    var done = this.async()

    var options = this.options({ banner: "" })
    var gccOptions = {}

    var banner = options.banner
    banner = grunt.template.process(banner ? banner + "\n" : "")

    // Parse options
    Object.keys(options).forEach(function(key) {
      if (key !== "banner") {
        gccOptions[key] = options[key]
      }
    })

    var files = this.files
    next()

    // Iterate over all src-dest file pairs
    function next() {
      var file = files.shift()
      file ? minify(file) : done()
    }

    // Error handler
    function failed(error) {
      grunt.log.error()
      grunt.verbose.error(error)
      grunt.fail.warn('Google Closure Compiler failed.')
      done()
    }

    function minify(file) {
      var source = file.src.filter(function(filepath) {
        var bool = grunt.file.exists(filepath)

        // Warn on and remove invalid source files
        if (!bool) {
          grunt.log.warn('Source file "' + filepath + '" not found.')
        }
        return bool
      })

      // Minify files, warn and fail on error
      var result = ""
      try {
        compiler.compile(source, gccOptions, function(error, stdout) {
          if (error) {
            failed(error)
            return
          }

          result = banner + stdout
          grunt.file.write(file.dest, result)
          grunt.log.writeln('File `' + file.dest + '` created.')

          // Task completed
          next()
        })
      }
      catch (error) {
        failed(error)
      }
    }

  })
}

