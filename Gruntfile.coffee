module.exports = (grunt) ->
  # MODULES
  fs = require('fs')
  path = require("path")

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

  rmdir = (dir) ->
    list = fs.readdirSync(dir)
    for content in list
      filename = path.join(dir, content)
      stat = fs.statSync(filename)

      if filename is '.' or filename is '..'
      else if stat.isDirectory()
        rmdir(filename)
      else
        fs.unlinkSync(filename)
    fs.rmdirSync(dir)

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
          '/tmp/grunt/js/visualization-widget.js': 'src/visualization-widget.coffee'
    uglify:
      display:
        src: '/tmp/grunt/js/visualization-display.js'
        dest: 'js/visualization-display.min.js'
      editor:
        src: ['libs/jquery.Jcrop.js', '/tmp/grunt/js/visualization-editor.js']
        dest: 'js/visualization-editor.min.js'
      widget:
        src: '/tmp/grunt/js/visualization-widget.js'
        dest: 'js/visualization-widget.min.js'
    copy:
      main:
        files: [
          {expand: true, cwd: '/tmp/grunt/js/', src: '*', dest: 'js/', filter: 'isFile'}
        ]
    concat:
      options:
        separator: ';'
      dist:
        src: ['libs/jquery.Jcrop.js', '/tmp/grunt/js/visualization-editor.js']
        dest: '/tmp/grunt/js/visualization-editor.js'

    grunt.loadNpmTasks('grunt-contrib-uglify')
    grunt.loadNpmTasks('grunt-contrib-coffee')
    grunt.loadNpmTasks('grunt-contrib-copy')
    grunt.loadNpmTasks('grunt-contrib-concat')

    grunt.registerTask('clean-js', () ->
      dir = 'js'
      rmdir(dir)
      fs.mkdirSync(dir)
      grunt.log.writeln("Js directory clean!").ok()
    )

    grunt.registerTask('go', 'Switch environments', (env) ->
      __ENV__ = env
      config = grunt.config.data.go
      setupPhp(config.phpFileLocation)
      grunt.task.run(['clean-js','coffee'])
      if __ENV__ is 'dev'
        grunt.task.run('concat')
        grunt.task.run('copy')
      else if __ENV__ is 'prod'
        grunt.task.run('uglify')
    )
  )
