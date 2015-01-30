module.exports = function(grunt) {

  grunt.initConfig({

    pkg: grunt.file.readJSON('package.json'),

    makedocs: {
      docs: {
        options: {
          layoutsDir: 'src/layouts',
          partialsDir: 'src/partials',
          componentsDir: 'src/components'
        },
        files: [
          {
            expand: true,
            cwd: 'src/pages',
            src: ['*.md'],
            dest: 'docs',
            ext: '.html'
          }
        ]
      }
    }

  });

  grunt.task.loadTasks('tasks')

  grunt.registerTask('default', ['makedocs']);

};