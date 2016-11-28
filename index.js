/* jshint node: true */
'use strict';

var path = require('path');
var browserify = require('broccoli-browserify');
var mergeTrees = require('broccoli-merge-trees');

module.exports = {
  name: 'ember-code-block',


  treeForVendor: function(tree){
    // Package up the highlight.js source from its node module.

    var src = this.treeGenerator(path.join(require.resolve('highlight.js'), '..', '..'));

    var highlight = browserify(src, {
      outputFile: 'browserified-highlight.js',
      require: [['./lib/index.js', {expose: 'highlight.js'}]]
    });
    return mergeTrees([highlight, tree]);
  },

  included: function(app) {
    app.import('vendor/browserified-highlight.js');
    app.import('vendor/highlight-style.css');
  }
};
