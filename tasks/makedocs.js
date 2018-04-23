/*
 * grunt-makedocs
 * https://github.com/chris5marsh/makedocs
 *
 * Copyright (c) 2015 Chris Marsh
 * Licensed under the MIT license.
 */

'use strict';

module.exports = function(grunt) {

  grunt.registerMultiTask('makedocs', "Make your documentation using Grunt", function() {

    var yfm = require('yaml-front-matter');
    var diveSync = require('diveSync');
    var marked = require('marked');
    var path = require('path');
    var Handlebars = require('handlebars');

    // For internationalisation
    var intlData = {
      locales: ['en-GB']
    };

    // Load and use polyfill for ECMA-402.
    if (!global.Intl) {
        global.Intl = require('intl');
    }
    var HandlebarsIntl = require('handlebars-intl');
    // Register helpers for date/time helpers
    HandlebarsIntl.registerWith(Handlebars);

    var options = this.options({
      layoutsDir: './layouts',
      partialsDir: './partials',
      build: false,
      postRender: false,
      nav: false
    });

    function MAKEDOCS(task) {

      this.task = task;
      this.templates = {};
      this.pages = [];

      this.run = function() {

        this.setupPartials();

        // Sort files into alpha order
        task.files.forEach(function(file) {
          file.src.filter(function(filepath) {
            // Remove nonexistent files
            if (!grunt.file.exists(filepath)) {
              grunt.log.warn('Source file "' + filepath + '" not found.');
              return false;
            } else {
              return true;
            }
          }).map(function(filepath) {
            // Read and return the file's YAML front-matter
            var contents = grunt.file.read(filepath);
            var config = yfm.loadFront(contents);
            if (typeof config.layout === 'undefined') {
              config.layout = 'default';
            }
            config.content = marked(config['__content']);
            delete config['__content'];
            config.dest = path.resolve(file.dest);
            config.build = options.build;
            this.pages.push(config);
          }, this);

        }, this);

        // Set up nav if needed
        if (options.nav && typeof options.nav === 'function') {
          options.nav(this.pages);
        }

        var pageCount = 0;
        // Make all the pages
        this.pages.forEach(function(page, i, p) {
          this.makeLayout(page);
          pageCount++;
          if (i === p.length - 1) {
            var pageWord = pageCount === 1 ? 'page' : 'pages';
            grunt.log.ok('Wrote '+pageCount+' '+pageWord);
          }
        }, this);

      };

      // Set up partials
      this.setupPartials = function() {
        var partialsPath = path.resolve(options.partialsDir);
        diveSync(partialsPath, function(err, file) {
          var partialName = path.basename(file, path.extname(file));
          var partialHTML = grunt.file.read(file);
          Handlebars.registerPartial(partialName, partialHTML);
        });
      };

      // Create HTML from layout template
      this.makeLayout = function(config) {

        var writePath = path.resolve(config.dest);
        var layoutPath = path.resolve(path.join(options.layoutsDir, config.layout+'.mustache'));
        var layoutHTML = grunt.file.read(layoutPath);
        var template = Handlebars.compile(layoutHTML, { noEscape: true });
        var html = template(config);
        // Send HTML through postRender function
        options.isDev = true;
        options.postRender(html, options, function(err, completeHTML) {
          if (err) {
            grunt.log.warn('Could not add components');
          }
          grunt.file.write(writePath, completeHTML);
          // Only log if verbose
          grunt.verbose.ok("Wrote file to " + writePath);
        });

      };

      this.htmlEntities = function(str) {
        return String(str).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
      };

    }

    var makedocs = new MAKEDOCS(this);
    makedocs.run();

  });

};
