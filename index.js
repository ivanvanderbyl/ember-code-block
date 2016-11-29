/* eslint node: true */

const path = require('path');
const Funnel = require('broccoli-funnel');
const mergeTrees = require('broccoli-merge-trees');
const AMDDefineFilter = require('./lib/amd-define-filter');
const rewriteLanguageDefinition = require('./lib/rewrite-language-definition');
const rename = require('broccoli-stew').rename;
const fs = require('fs');
const hljs = require('highlight.js');
var inclusionFilter = require('./lib/inclusion-filter');
var exclusionFilter = require('./lib/exclusion-filter');

module.exports = {
  name: 'ember-code-block',

  included(app) {
    this._super.included && this._super.included.apply(this, arguments);
    this.app = app;

    let config = app.project.config(app.env) || {};
    // let addonConfig = config[this.name] || {};
    let addonConfig = { languages: {only: ['xml', 'json'] }}

    this.languages = this.getLanguages(addonConfig);

    this.import(path.join('vendor', 'highlight', 'highlight.js'));

    let importAssert = this.import.bind(this);
    this.languages.forEach((function(language) {
      importAssert(path.join('vendor', 'highlight', 'languages', `${language}.js`));
    }))

    // app.import('vendor/highlight-style.css');
  },

  getLanguages(config) {
    let allLanguages = this._allLanguages();
    let languages = config.languages || {only: [], except: []}
    let onlyLanguages = languages.only || [];
    let exceptLanguages = languages.except || [];
    return allLanguages
      .filter(inclusionFilter(onlyLanguages))
      .filter(exclusionFilter(exceptLanguages));
  },

  treeForVendor(tree) {
    let trees = [];
    trees.push(this._highlightTree())

    let languageTree = this._languageTree;

    this.languages.forEach(function(language) {
      trees.push(languageTree(language))
    });

    // Push language loader

    return mergeTrees(trees);
  },

  _allLanguages() {
    let languages = [];
    let languagesPath = path.join(require.resolve('highlight.js'), '../languages')
    fs.readdirSync(languagesPath).map(function(file) {
      let lang = require(path.join(languagesPath, file))(hljs)
      languages.push(file.split('.')[0])
      if (lang.aliases) {
        lang.aliases.forEach(function(alias) {
          if (languages.indexOf(alias) === -1) {
            languages.push(alias);
          }
        })
      }
    })

    return languages
  },

  _languageTree(language) {
    let srcPath = path.join(require.resolve('highlight.js'), '..', 'languages');

    let tree = new Funnel(srcPath, {
      include: [`${language}.js`],
      destDir: `/languages/${language}.js`,
      annotation: `Funnel: highlight.js language: ${language}`
    });

    let srcTree = new AMDDefineFilter(tree, language, {
      rewriterFunction: rewriteLanguageDefinition
    });

    return rename(srcTree, function() {
      return `/highlight/languages/${language}.js`;
    });
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
