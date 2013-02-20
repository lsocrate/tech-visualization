module.exports = (grunt) ->
  # Config
  grunt.initConfig(
    pkg: grunt.file.readJSON('package.json')
    coffee:
      compile:
        files:
          '/tmp/grunt/js/visualization-display.js': 'src/visualization-display.coffee'
          '/tmp/grunt/js/visualization-editor.js': 'src/visualization-editor.coffee'
          # '/tmp/grunt/js/visualization-widget.js': 'src/visualization-widget.coffee'
    uglify:
      display:
        src: '/tmp/grunt/js/visualization-display.js'
        dest: 'js/visualization-display.min.js'
      editor:
        src: ['libs/jquery.Jcrop.js', '/tmp/grunt/js/visualization-editor.js']
        dest: 'js/visualization-editor.min.js'
      # widget:
      #   src: '/tmp/grunt/js/visualization-widget.js'
      #   dest: 'js/visualization-widget.min.js'

    grunt.loadNpmTasks('grunt-contrib-uglify');
    grunt.loadNpmTasks('grunt-contrib-coffee');

    # Default task(s).
    grunt.registerTask('default', ['coffee', 'uglify']);
  )