module.exports = (grunt) ->
  __ENV__ = null
  setContantToCorrectJsForEnvironment = (line, boilerplate, file, location) ->
    switch __ENV__
      when 'dev'
        if /\.min\.js$/.test(location)
          location = location.replace(/\.js$/, '.min.js')
      when 'prod'
        unless /\.min\.js$/.test(location)
          location = location.replace(/\.min\.js$/, '.js')

    boilerplate + file + ' = "' + location + '";'

  fs = require('fs')
  setupPhp = (file) ->
    php = fs.readFileSync(file).toString()
    php = php.replace(/(\s*const )(JS_DISPLAY)[^;]*"([^;]*)";/, setContantToCorrectJsForEnvironment, 'm')
    php = php.replace(/(\s*const )(JS_EDITOR)[^;]*"([^;]*)";/, setContantToCorrectJsForEnvironment, 'm')
    fs.writeFileSync(file, php)

  # Config
  grunt.initConfig(
    pkg: grunt.file.readJSON('package.json')
    go:
      phpFileLocation: 'tech-visualization.php'
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
    grunt.registerTask('go', 'Switch environments', (env) ->
      __ENV__ = env
      config = grunt.config.data.go
      setupPhp(config.phpFileLocation)
    )
  )