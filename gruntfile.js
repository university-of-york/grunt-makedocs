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
      tests: ['tmp']
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
            var navPage = "src/partials/nav.mustache";
            var categories = {};
            pages.forEach(function(page, i) {
              if (page.category === false) {
                // Top level page
                categories[page.name] = page;
              } else {
                if (typeof categories[page.category] === 'undefined') {
                  categories[page.category] = [];
                }
                categories[page.category].push(page);
              }
              if (i === pages.length - 1) {
                var output = '<ul>\n';
                for (var c in categories) {
                  // Top level pages have a 'false' category value
                  if (categories[c].category === false) {
                    output+= '  <li><a href="'+path.basename(categories[c].dest)+'">'+categories[c].title+'</a></li>\n';
                  } else {
                    output+= '  <li>\n';
                    output+= '    <a href="#">'+c+'</a>\n';
                    output+= '    <ul>\n';
                    // Loop through category pages
                    categories[c].forEach(function(j, p) {
                      var thisPage = categories[c][p];
                      output+= '      <li><a href="'+path.basename(thisPage.dest)+'">'+thisPage.title+'</a></li>\n';
                    });
                    output+= '    </ul>\n';
                    output+= '  </li>\n';
                  }
                }
                output+= '</ul>\n';
                grunt.file.write(navPage, output);

              }
            });
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
