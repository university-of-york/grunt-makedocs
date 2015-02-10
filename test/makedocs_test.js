'use strict';

var grunt = require('grunt');

/*
  ======== A Handy Little Nodeunit Reference ========
  https://github.com/caolan/nodeunit

  Test methods:
    test.expect(numAssertions)
    test.done()
  Test assertions:
    test.ok(value, [message])
    test.equal(actual, expected, [message])
    test.notEqual(actual, expected, [message])
    test.deepEqual(actual, expected, [message])
    test.notDeepEqual(actual, expected, [message])
    test.strictEqual(actual, expected, [message])
    test.notStrictEqual(actual, expected, [message])
    test.throws(block, [error], [message])
    test.doesNotThrow(block, [error], [message])
    test.ifError(value)
*/

exports.makedocs = {
  setUp: function(done) {
    // setup here if necessary
    done();
  },
  index: function(test) {
    test.expect(1);

    var actual = grunt.file.read('docs/index.html');
    var expected = grunt.file.read('test/expected/index.html');
    test.equal(actual, expected, 'The index.html file has not been created properly');

    test.done();
  },
  buttons: function(test) {
    test.expect(1);

    var actual = grunt.file.read('docs/buttons.html');
    var expected = grunt.file.read('test/expected/buttons.html');
    test.equal(actual, expected, 'The buttons.html file has not been created properly');

    test.done();
  },
  grid: function(test) {
    test.expect(1);

    var actual = grunt.file.read('docs/grid.html');
    var expected = grunt.file.read('test/expected/grid.html');
    test.equal(actual, expected, 'The grid.html file has not been created properly');

    test.done();
  }

};
