import { moduleForComponent, test } from 'ember-qunit';
import hbs from 'htmlbars-inline-precompile';

moduleForComponent('code-block', 'Integration | Component | code block', {
  integration: true
});

const codeBlock = `
var message = "hello world";
`;

test('it renders code', function(assert) {
  this.set('code', codeBlock);
  this.render(hbs`{{code-block code}}`);

  assert.equal(this.$('pre.hljs code').html().trim(), '<span class="hljs-attribute">var message</span> = <span class="hljs-string">"hello world"</span>;');
});
