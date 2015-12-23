// Should move this out seperately so that front and back end could use it too
// Needs compiled Handlebars templates (OK), forEach and Object.keys
module.exports = function(type, config) {

  console.log(grunt);

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
