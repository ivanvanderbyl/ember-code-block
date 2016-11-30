import Ember from 'ember';
import layout from './template';
import Component from 'ember-component';
import Highlight from 'highlight';

const { run: { scheduleOnce } } = Ember;

const CodeBlockComponent = Component.extend({
  layout,
  tagName: 'pre',

  language: null,
  tabReplace: ' ',
  classPrefix: null,

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
      let config = { tabReplace };
      if (language) {
        config.languages = language;
      }

      if (classPrefix) {
        config.classPrefix = classPrefix;
      }

      Highlight.configure(config);
      Highlight.highlightBlock(this.element);
    }
  }
});

CodeBlockComponent.reopenClass({
  positionalParams: ['code']
});

export default CodeBlockComponent;
