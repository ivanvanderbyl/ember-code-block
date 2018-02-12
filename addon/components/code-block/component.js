import layout from './template'
import Component from '@ember/component'
import Highlight from 'highlight'
import { isPresent } from '@ember/utils'
import { computed } from '@ember/object'
import { htmlSafe } from '@ember/string'

const CodeBlockComponent = Component.extend({
	layout,
	tagName: 'pre',

	classNames: ['hljs'],

	tabReplace: ' ',
	classPrefix: null,

	code: null,

	highlightedCode: computed('code', {
		get() {
			let code = this.get('code')
			let tabReplace = this.get('tabReplace')
			let classPrefix = this.get('classPrefix')

			let config = { tabReplace }

			if (classPrefix) {
				config.classPrefix = classPrefix
			}

			if (isPresent(code)) {
				Highlight.configure(config)
				let result = Highlight.highlightAuto(code)
				return htmlSafe(result.value)
			} else {
				return ''
			}
		},
	}),
})

CodeBlockComponent.reopenClass({
	positionalParams: ['code'],
})

export default CodeBlockComponent
