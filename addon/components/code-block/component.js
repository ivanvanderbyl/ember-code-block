import Ember from 'ember';
import layout from './template';
import Component from 'ember-component';
import Highlight from 'highlight.js';
// import jsonLanguage from 'json';

const { run: { scheduleOnce } } = Ember;

const CodeBlockComponent = Component.extend({
  layout,
  tagName: 'pre',

  language: null,

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
    if (this.element) {
      // console.log(Highlight.inherit);
      Highlight.highlightBlock(this.element);
    }
  }
});

CodeBlockComponent.reopenClass({
  positionalParams: ['code']
});

export default CodeBlockComponent;
