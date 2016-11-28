/* eslint node: true, esnext: false */
'use strict';

let path = require('path');
var Funnel = require('broccoli-funnel');
let mergeTrees = require('broccoli-merge-trees');
let AMDDefineFilter = require('./lib/amd-define-filter');
var rename = require('broccoli-stew').rename;

module.exports = {
  name: 'ember-code-block',

  treeForVendor(tree) {
    let trees = [];

    // Package up the highlight.js source from its node module.
    let srcPath = path.join(require.resolve('highlight.js'), '..');

    var tree = new Funnel(srcPath, {
      include: ['highlight.js'],
      destDir: `/highlight.js`,
      annotation: `Funnel: highlight.js`
    });

    var srcTree = new AMDDefineFilter(tree, "highlight.js");
    trees.push(rename(srcTree, function() {
      return `/highlight/highlight.js`;
    }));

    return mergeTrees(trees);
  },

  included(app) {
    this._super.included && this._super.included.apply(this, arguments);
    this.app = app;
    this.import(path.join('vendor', 'highlight', 'highlight.js'));
    // app.import('vendor/highlight-style.css');
  }
};
