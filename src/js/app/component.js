/*
 * Allows this file to be used as a RequireJS module (e.g. in our site build):
 *
 * define(['component'], function(component) {
 *    var c = new component();
 * });
 *
 * Or as a CommonJS module (e.g. in Node):
 *
 * var component = require('./component');
 * var c = new component();
 *
 * Or globally (e.g. in HTML):
 *
 * <script src="component.js"></script>
 * <script>var c = new component();</script>
 */

(function (name, context, definition) {
  if (typeof module != 'undefined' && module.exports) module.exports = definition()
  else if (typeof define == 'function' && define.amd) define(definition)
  else context[name] = definition()
})('component', this, function () {

  var COMPONENT = function(type, options, isDoc) {

    // Check to see if we're in documentation mode
    isDoc = options === true || isDoc === true;

    console.log(type, options, isDoc);

    return '<button>'+options.text+'</button>';

    // get template from type
    // compile it with options
    // return HTML

  };

  return COMPONENT;

});