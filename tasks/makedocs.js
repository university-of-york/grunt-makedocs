/*
 * grunt-makedocs
 *
 * Copyright (c) 2015 Chris Marsh
 * Licensed under the MIT license.
 */

'use strict';

module.exports = function(grunt) {

  grunt.registerMultiTask('makedocs', "Creates the documentation from src into dest", function() {

    var yfm = require('yaml-front-matter');
    var diveSync = require('diveSync');
    var marked = require('marked');
    var path = require('path');
    var cheerio = require('cheerio');
    var fs = require('fs');
    var Handlebars = require('handlebars');
    var Component = require('../src/js/app/component.js');

    // Set defaults in case these are't specified
    var options = this.options({
      layoutsDir: './layouts',
      partialsDir: './partials',
      componentsDir: './components'
    });

    var makeLayout = function(config) {
      var writePath = path.resolve(config.dest);
      var layoutPath = path.resolve(path.join(options.layoutsDir, config.layout+'.mustache'));
      var layoutHTML = grunt.file.read(layoutPath);
      var template = Handlebars.compile(layoutHTML, { noEscape: true });
      var html = template(config);
      addComponents(html, function(completeHTML) {
        grunt.file.write(writePath, html);
      });
    };

    // This is a horrible way to get the JS function calls
    var addComponents = function(html, onComplete) {
      var completeHTML = html;
      // Parse HTML for script tags
      var $ = cheerio.load(html);
      var scripts = $('body script');
      // For each script, get the individual lines
      scripts.each(function(i, script) {
        var r = '';
        var content = script.children[0].data.split('\n').filter(function(c) {
          if (c === '') return false;
          return true;
        }).map(function(c) {
          var componentText = c.match(/component\((.*)\)/i);
          console.log(componentText[1]);
          console.log(i+'~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~');
        });
      });
      console.log('~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~');
      // new Component(1, 2, 3);
      onComplete(completeHTML);
    }

    // Set up partials
    var partialsPath = path.resolve(options.partialsDir);
    diveSync(partialsPath, function(err, file) {
      var partialName = path.basename(file, path.extname(file));
      var partialHTML = grunt.file.read(file);
      Handlebars.registerPartial(partialName, partialHTML);
    });

    this.files.forEach(function(file) {

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
        // config.content = entities.decode(marked(config['__content']));
        config.content = marked(config['__content']);
        delete config['__content'];
        config.dest = file.dest;
        makeLayout(config);
        // return config;
      });

    });

  });

};
