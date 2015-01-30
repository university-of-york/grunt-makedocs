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
    var fs = require('fs');
    var Handlebars = require('handlebars');

    // Set defaults in case these are't specified
    var options = this.options({
      layoutsDir: './layouts',
      partialsDir: './partials',
      componentsDir: './components'
    });

    var makeLayout = function(config) {
      var layoutPath = path.resolve(path.join(options.layoutsDir, config.layout+'.mustache'));
      var layoutHTML = grunt.file.read(layoutPath);
      var template = Handlebars.compile(layoutHTML, { noEscape: true });
      var html = template(config);
      var writePath = path.resolve(config.dest);
      grunt.file.write(writePath, html);
    };

    // Set up partials
    var partialsPath = path.resolve(options.partialsDir);
    diveSync(partialsPath, function(err, file) {
      var partialName = path.basename(file, path.extname(file));
      //grunt.log.writeln(partialName);
      var partialHTML = grunt.file.read(file);
      Handlebars.registerPartial(partialName, partialHTML);
    });

    this.files.forEach(function(file) {

      file.src.filter(function(filepath) {
        // Remove nonexistent files (it's up to you to filter or warn here).
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
