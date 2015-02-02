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
    var cheerio = require('cheerio');
    var marked = require('marked');
    var path = require('path');
    var vm = require('vm');
    var fs = require('fs');
    var Handlebars = require('handlebars');
    var component = require('../src/js/app/component.js');

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
      // Better to precompile scripts into components instead of doing it at runtime
      addComponents(html, function(completeHTML) {
        grunt.file.write(writePath, completeHTML);
      });
    };

    // This is a horrible way to get the JS function calls
    var addComponents = function(html, onComplete) {
      // Eval HTML
      var $ = cheerio.load(html);
      // Get all the scripts
      var scripts = $('body script');
      // For each script, get the individual lines
      scripts.each(function(i, script) {
        var scriptContent = '';
        // Remove blank lines
        script.children[0].data.split('\n').filter(function(l) {
          if (l === '') return false;
          return true;
        }).map(function(l) {
          // Eval HTML in new context - pass component function into context
          var ev = vm.runInNewContext(l, { component: component });
          scriptContent+= ev+'\n';
        });
        $(script).after(scriptContent).remove();
        if (i === scripts.length - 1) {
          onComplete($.html());
        }
      });
    };

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
