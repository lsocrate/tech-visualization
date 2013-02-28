module.exports = (grunt) ->
  # MODULES
  fs = require('fs')

  # ENVIRONMENT
  __ENV__ = null

  setContantToCorrectJsForEnvironment = (line, boilerplate, file, location) ->
    switch __ENV__
      when 'dev'
        if /\.min\.js$/.test(location)
          location = location.replace(/\.min\.js$/, '.js')
      when 'prod'
        unless /\.min\.js$/.test(location)
          location = location.replace(/\.js$/, '.min.js')

    boilerplate + file + ' = "' + location + '";'

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
          '/tmp/grunt/tech-visualization/js/visualization-display.js': 'src/visualization-display.coffee'
          '/tmp/grunt/tech-visualization/js/visualization-editor.js': 'src/visualization-editor.coffee'
          '/tmp/grunt/tech-visualization/js/visualization-widget.js': 'src/visualization-widget.coffee'
    uglify:
      display:
        src: '/tmp/grunt/tech-visualization/js/visualization-display.js'
        dest: 'js/visualization-display.min.js'
      editor:
        src: ['libs/jquery.Jcrop.js', '/tmp/grunt/tech-visualization/js/visualization-editor.js']
        dest: 'js/visualization-editor.min.js'
      widget:
        src: '/tmp/grunt/tech-visualization/js/visualization-widget.js'
        dest: 'js/visualization-widget.min.js'
    copy:
      main:
        files: [
          {expand: true, cwd: '/tmp/grunt/tech-visualization/js/', src: '*', dest: 'js/', filter: 'isFile'}
        ]
    concat:
      options:
        separator: ';'
      dist:
        src: ['libs/jquery.Jcrop.js', '/tmp/grunt/tech-visualization/js/visualization-editor.js']
        dest: '/tmp/grunt/tech-visualization/js/visualization-editor.js'
    watch:
      scripts:
        files: 'src/*.coffee'
        tasks: ['clean', 'coffee', 'concat', 'copy']
        options:
          interrupt: true
    clean: ["js"]

    grunt.loadNpmTasks('grunt-contrib-uglify')
    grunt.loadNpmTasks('grunt-contrib-coffee')
    grunt.loadNpmTasks('grunt-contrib-copy')
    grunt.loadNpmTasks('grunt-contrib-concat')
    grunt.loadNpmTasks('grunt-contrib-watch')
    grunt.loadNpmTasks('grunt-contrib-clean');

    grunt.registerTask('go', 'Switch environments', (env) ->
      __ENV__ = env
      config = grunt.config.data.go
      setupPhp(config.phpFileLocation)
      grunt.task.run(['clean', 'coffee'])
      if __ENV__ is 'dev'
        grunt.task.run('concat')
        grunt.task.run('copy')
        grunt.task.run('watch')
      else if __ENV__ is 'prod'
        grunt.task.run('uglify')
    )
  )
