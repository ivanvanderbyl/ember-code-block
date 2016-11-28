/* eslint node: true */

const path = require('path');
const Funnel = require('broccoli-funnel');
const mergeTrees = require('broccoli-merge-trees');
const AMDDefineFilter = require('./lib/amd-define-filter');
const rename = require('broccoli-stew').rename;

module.exports = {
  name: 'ember-code-block',

  included(app) {
    this._super.included && this._super.included.apply(this, arguments);
    this.app = app;

    let config = app.project.config(app.env) || {};
    let addonConfig = config[this.name] || {};

    let languages = this.getLanguages(addonConfig);

    this.import(path.join('vendor', 'highlight', 'highlight.js'));
    // app.import('vendor/highlight-style.css');
  },

  getLanguages(addonConfig) {
    let onlyLanguages = config.only || [];
    let exceptLanguages = config.except || [];

  },

  treeForVendor(tree) {
    let trees = [];
    trees.push(this._highlightTree())

    return mergeTrees(trees);
  },

  _highlightTree() {
    // Package up the highlight.js source from its node module.
    let srcPath = path.join(require.resolve('highlight.js'), '..');

    let tree = new Funnel(srcPath, {
      include: ['highlight.js'],
      destDir: `/highlight.js`,
      annotation: `Funnel: highlight.js`
    });

    let srcTree = new AMDDefineFilter(tree, "highlight.js");
    return rename(srcTree, function() {
      return `/highlight/highlight.js`;
    });
  }

};
