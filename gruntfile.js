/*
 * grunt-makedocs
 * https://github.com/chris5marsh/makedocs
 *
 * Copyright (c) 2015 Chris Marsh
 * Licensed under the MIT license.
 */

'use strict';

module.exports = function(grunt) {

  var path = require('path');

  // Project configuration.
  grunt.initConfig({
    jshint: {
      all: [
        'Gruntfile.js',
        'tasks/*.js',
        '<%= nodeunit.tests %>'
      ],
      options: {
        jshintrc: '.jshintrc'
      }
    },

    // Before generating any new files, remove any previously-created files.
    clean: {
      tests: ['docs']
    },

    // Configuration to be run (and then tested).
    makedocs: {
      default_options: {
        options: {
          layoutsDir: 'src/layouts',
          partialsDir: 'src/partials',
          componentsDir: 'src/components',
          build: true,
          nav: function(pages) {
            var navPage = "partials/nav.html";
            var output = '<ul>';
            pages.forEach(function(page, i) {
              output+= '<li><a href="'+page.dest+'">'+page.title+'</a></li>';
            });
            output+= '</ul>';
            grunt.file.write(navPage, output);
          }
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
    },

    // Unit tests.
    nodeunit: {
      tests: ['test/*_test.js']
    }

  });

  // Actually load this plugin's task(s).
  grunt.loadTasks('tasks');

  // These plugins provide necessary tasks.
  grunt.loadNpmTasks('grunt-contrib-jshint');
  grunt.loadNpmTasks('grunt-contrib-clean');
  grunt.loadNpmTasks('grunt-contrib-nodeunit');

  // Whenever the "test" task is run, first clean the "tmp" dir, then run this
  // plugin's task(s), then test the result.
  grunt.registerTask('test', ['clean', 'makedocs', 'nodeunit']);

  // By default, lint and run all tests.
  grunt.registerTask('default', ['jshint', 'test']);

};
