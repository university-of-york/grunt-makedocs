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
    //var component = require('./component')
    var component = function(type, config) {

      var template = templates[type];

      // if config is just a string, it's simple content
      var configType = toType(config);
      if (configType === 'string') {
        config = { "content": config };
      }

      // if config has an atoms key, compile those and replace atom object with HTML
      var atomsType = toType(config.atoms);
      var atomHTML;
      if (atomsType !== 'undefined') {
        if (atomsType === 'object') {
          // Just a single atom
          var c = Object.keys(config.atoms)[0];
          var o = config.atoms[c];
          if (toType(o) === 'object') {
            o.parentConfig = config;
          }
          atomHTML = component(c, o);
          config.atoms = [atomHTML];
        } else if (atomsType === 'array') {
          // Multiple atoms
          config.atoms.forEach(function(atom, i) {
            var c, o;
            var t = toType(atom);
            if (toType(atom.component) !== 'undefined') {
              // object passed with "component" key and "options" key
              c = atom.component;
              o = atom.options;
              o.parentConfig = config;
              atomHTML = component(c, o);
             } else if (t === 'string') {
              // Using var that has already been parsed
              c = atom;
              o = false;
              atomHTML = atom;
             } else {
              // Shorthand { "component": "options" } object
              c = Object.keys(atom)[0];
              o = atom[c];
              o.parentConfig = config;
              atomHTML = component(c, o);
            }
            config.atoms[i] = atomHTML;
          });
        }
      }

      // compile it with options
      var html = template(config, { data: { intl: intlData } });
      return html;

    }
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
      componentsDir: './components',
      build: false,
      nav: false
    });

    // For internationalisation
    var intlData = {
      locales: ['en-GB']
    };

    var templates = {};

    // https://javascriptweblog.wordpress.com/2011/08/08/fixing-the-javascript-typeof-operator/
    var toType = function(obj) {
      return ({}).toString.call(obj).match(/\s([a-zA-Z]+)/)[1].toLowerCase();
    }

    function MAKEDOCS(task) {

      this.task = task;
      this.templates = {};
      this.pages = [];

      this.run = function() {

        this.setupPartials();
        this.setupComponents();

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
            var pageWord = pageCount == 1 ? 'page' : 'pages';
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
          // Only log if verbose
          grunt.verbose.ok("Wrote file to " + writePath);
        });

      };

      // This is a hacky way to get the JS function calls
      this.addComponents = function(html, onComplete) {

        var $ = cheerio.load(html, { decodeEntities: false });
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

          // Safe eval()
          if (script.children.length !== 0) {

            var ev = vm.runInNewContext(script.children[0].data, { component: component });

            if (typeof ev === 'undefined') {
              return;
            }

            var scriptContent = beautify(ev, beautifyOptions);

            // If we're doing documentation
            var docContent = '<pre><code class="language-markup">';
            docContent+= htmlEntities(scriptContent);
            docContent+= '\n</code></pre>';

            $(script).after('\n\n'+docContent).after('\n\n'+scriptContent).remove();

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
