import Controller from '@ember/controller';

export default Controller.extend({

  code: `import Ember from 'ember';
import layout from './template';
import Component from 'ember-component';
import Highlight from 'highlight.js';
import xml from 'highlight/languages/xml';

const { run: { scheduleOnce } } = Ember;

const CodeBlockComponent = Component.extend({
  layout,
  tagName: 'pre',

  language: null,
  style: 'railscasts',
  tabReplace: '  ',
  classPrefix: '  ',

  code: null,

  didInsertElement() {
    this.scheduleHighlightCode();
  },

  didReceiveAttrs() {
    this.scheduleHighlightCode();
  },

  scheduleHighlightCode() {
    scheduleOnce('render', this, this.highlightCode);
  },

  highlightCode() {
    let tabReplace = this.get('tabReplace');
    let classPrefix = this.get('classPrefix');
    let language = this.get('language');

    if (this.element) {
      Highlight.registerLanguage('xml', xml);

      // console.log(Highlight.inherit);
      Highlight.highlightBlock(this.element, {
        tabReplace,
        classPrefix,
        languages: [language]
      });
    }
  }
});

CodeBlockComponent.reopenClass({
  positionalParams: ['code']
});

export default CodeBlockComponent;
`
});
