/*global module:false*/
module.exports = function(grunt) {
  grunt.template.addDelimiters('d', '{%', '%}')

  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),
    dirs: {
      src: 'src',
      dest: 'dist',
      plugins: 'src/plugins'
    },
    concat: {
      options: {
        separator: '',
        process: {
          'delimiters': 'd',
          'data': {
            'VERSION': '<%= pkg.version %>'
          }
        }
      },
      seajs: {
        src: ['<%= dirs.src %>/intro.js',
              '<%= dirs.src %>/sea.js',
              '<%= dirs.src %>/util-lang.js', '<%= dirs.src %>/util-log.js', '<%= dirs.src %>/util-events.js',
              '<%= dirs.src %>/util-path.js', '<%= dirs.src %>/util-request.js', '<%= dirs.src %>/util-deps.js',
              '<%= dirs.src %>/module.js', '<%= dirs.src %>/config.js', '<%= dirs.src %>/bootstrap.js',
              '<%= dirs.src %>/outro.js'],
        dest: '<%= dirs.dest %>/sea-debug.js'
      }
    },
    uglify: {
      seajs: {
        options: {
          banner: '<%= banner %>',
          sourceMap: '<%= dirs.dest %>/sea.js.map',
          sourceMappingURL: 'sea.js.map',
          sourceMapPrefix: 1,
          preserveComments: 'some',
          mangle: {
         //   except: ['console', 'seajs', 'define', 'module', 'require']
          }
        },
        files: {
          '<%= dirs.dest %>/sea.js': '<%= concat.seajs.dest %>'
        }
      },
      plugins: {
        options: {
          preserveComments: 'some',
          mangle: {
         //   except: ['console', 'seajs', 'define', 'module', 'require']
          }
        },
        files: {} // add later
      }
    }
  });
  // Add plugins to uglify:plugins task
  ~ function(grunt, undefined) {
    var plugin_list = grunt.file.expand(grunt.config.get('dirs.plugins') + '/*.js')
      , plugin_files = {}
    while(plugin_list.length) {
      var plugin = plugin_list.shift()
        , plugin_name = plugin.match(/[\/\/]([^\.\/\\]+)\.js$/)[1]
      
      plugin_files['<%= dirs.dest %>/' + plugin_name + '.js'] = plugin
    }
    grunt.config.set('uglify.plugins.files', plugin_files)
  }(grunt)

  grunt.loadNpmTasks('grunt-contrib-concat')
  grunt.loadNpmTasks('grunt-contrib-uglify')

  grunt.registerTask('build_seajs', ['concat', 'uglify:seajs'])
  grunt.registerTask('build_plugins', ['uglify:plugins'])
  grunt.registerTask('default', ['build_seajs'])
  grunt.registerTask('all', ['build_seajs', 'build_plugins'])

};
