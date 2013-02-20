module.exports = (grunt) ->
  # Config
  grunt.initConfig(
    pkg: grunt.file.readJSON('package.json')
    coffee:
      compile:
        files:
          'js/visualization-display.js': 'src/visualization-display.coffee'
          'js/visualization-editor.js': 'src/visualization-editor.coffee'
          'js/visualization-widget.js': 'src/visualization-widget.coffee'
    uglify:
      display:
        src: 'js/visualization-display.js'
        dest: 'build/visualization-display.min.js'
      editor:
        src: ['libs/jquery.Jcrop.js', 'js/visualization-editor.js']
        dest: 'build/visualization-editor.min.js'
      widget:
        src: 'js/visualization-widget.js'
        dest: 'build/visualization-widget.min.js'

    grunt.loadNpmTasks('grunt-contrib-uglify');
    grunt.loadNpmTasks('grunt-contrib-coffee');

    # Default task(s).
    grunt.registerTask('default', ['coffee', 'uglify']);
  )