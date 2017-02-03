import Ember from 'ember';
import layout from './template';
import Component from 'ember-component';
import Highlight from 'highlight';

const { isPresent, computed, String: { htmlSafe } } = Ember;

const CodeBlockComponent = Component.extend({
  layout,
  tagName: 'pre',

  classNames: ['hljs'],

  language: null,
  tabReplace: ' ',
  classPrefix: null,

  code: null,

  highlightedCode: computed('code', {
    get() {
      let code = this.get('code');
      let tabReplace = this.get('tabReplace');
      let classPrefix = this.get('classPrefix');
      let language = this.get('language');

      let config = { tabReplace };
      if (language) {
        config.languages = language;
      }

      if (classPrefix) {
        config.classPrefix = classPrefix;
      }

      if (isPresent(code)) {
        Highlight.configure(config);
        let result = Highlight.highlightAuto(code);
        return htmlSafe(result.value);
      } else {
        return '';
      }
    }
  })
});

CodeBlockComponent.reopenClass({
  positionalParams: ['code']
});

export default CodeBlockComponent;
