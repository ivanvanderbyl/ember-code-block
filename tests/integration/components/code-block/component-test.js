import { module, test } from 'qunit'
import { setupRenderingTest } from 'ember-qunit'
import { render, find } from '@ember/test-helpers'
import hbs from 'htmlbars-inline-precompile'

module('Integration | Component | code block', function(hooks) {
	setupRenderingTest(hooks)

	const codeBlock = `
  var message = "hello world";
  `

	test('it renders code', async function(assert) {
		this.set('code', codeBlock)
		await render(hbs`{{code-block code}}`)

		assert.equal(
			find('pre.hljs code').innerHTML.trim(),
			'<span class="hljs-keyword">var</span> message = <span class="hljs-string">"hello world"</span>;',
		)
	})
})
