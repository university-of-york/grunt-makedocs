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

    var beautify = require('js-beautify').html;
    var yfm = require('yaml-front-matter');
    var diveSync = require('diveSync');
    var cheerio = require('cheerio');
    var marked = require('marked');
    var path = require('path');
    var vm = require('vm');
    var fs = require('fs');
    var Handlebars = require('handlebars');

    var options = this.options({
      layoutsDir: './layouts',
      partialsDir: './partials',
      componentsDir: './components',
      build: false,
      nav: false
    });

    var templates = {};

    // Could move this out seperately? So that front and back end could use it?
    // Needs compiled Handlebars templates (OK), forEach and Object.keys
    function component(type, config) {

      var template = templates[type];

      // if config has an atoms key, compile those and replace atom object with HTML
      if (typeof config.atoms !== 'undefined') {
        config.atoms.forEach(function(atom, i) {
          // if (typeof atom.component !== 'undefined') {
          // TODO: can pass as object with "component" key and "options" key, or as "component": "options" object
          // } else {
          var c = Object.keys(atom)[0];
          var o = atom[c];
          o.parentConfig = config;
          var atomHTML = component(c, o);
          config.atoms[i] = atomHTML;
          // }
        });
      }

      // compile it with options
      var html = template(config);

      return html;

    }

    function MAKEDOCS(task) {

      this.task = task;
      this.templates = {};
      this.pages = [];

      this.run = function() {

        this.setupPartials();
        this.setupComponents();

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
            config.content = marked(config['__content'], { langPrefix:'language'});
            delete config['__content'];
            // Get filename from 'name', or from dest
            var filename = config.name || path.basename(file.dest, path.extname(file.dest));
            config.dest = path.join(path.dirname(file.dest), filename+path.extname(file.dest));
            console.log(config.dest);
            config.build = options.build;
            this.pages.push(config);
          }, this);

        }, this);

        // Set up nav if needed
        if (options.nav && typeof options.nav === 'function') {
          options.nav(this.pages);
        }

        // Make all the pages
        this.pages.forEach(function(page, i) {
          this.makeLayout(page);
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

      // Compile component templates
      this.setupComponents = function() {
        var componentsPath = path.resolve(options.componentsDir);
        diveSync(componentsPath, function(err, file) {
          var componentName = path.basename(file, path.extname(file));
          var componentHTML = grunt.file.read(file);
          templates[componentName] = Handlebars.compile(componentHTML, { noEscape: true });
        });
      };

      // Create HTML from layout template
      this.makeLayout = function(config) {

        var writePath = path.resolve(config.dest);
        var layoutPath = path.resolve(path.join(options.layoutsDir, config.layout+'.mustache'));
        var layoutHTML = grunt.file.read(layoutPath);
        var template = Handlebars.compile(layoutHTML, { noEscape: true });
        var html = template(config);
        // Better to precompile scripts into components instead of doing it at runtime
        this.addComponents(html, function(err, completeHTML) {
          if (err) {
            grunt.log.warn('Could not add components');
          }
          grunt.file.write(writePath, completeHTML);
          grunt.log.ok("Wrote file to " + writePath);
        });

      };

      // This is a horrible way to get the JS function calls
      this.addComponents = function(html, onComplete) {

        var $ = cheerio.load(html);
        // Get all the scripts
        var scripts = $('body script');
        var htmlEntities = this.htmlEntities;
        var beautifyOptions = {
          "indent_size": 2,
          "indent_char": " "
        }
        // For each script, get the individual lines
        if (scripts.length === 0) {
          onComplete(null, html);
        }
        scripts.each(function(i, script) {
          var scriptContent = '';
          // Remove blank lines
          if (script.children.length !== 0) {
            script.children[0].data.split(';').filter(function(l) {
              if (l === '' || l === null || l === false) {
                return false;
              }
              return true;
            }).map(function(l) {
              // Eval HTML in new context - pass component function into context
              var ev = vm.runInNewContext(l, { component: component });
              if (typeof ev === 'undefined') {
                return;
              }
              scriptContent+= '\n'+ev;
            });
            scriptContent = beautify(scriptContent, beautifyOptions);
            // If we're doing documentation
            var docContent = '<pre><code class="lang-html">';
            docContent+= htmlEntities(scriptContent);
            docContent+= '\n</code></pre>';
            $(script).after('\n\n'+docContent).after(scriptContent).remove();
          }
          if (i === scripts.length - 1) {
            onComplete(null, $.html());
          }
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
