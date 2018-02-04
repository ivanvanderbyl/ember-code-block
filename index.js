const path = require('path')
const Funnel = require('broccoli-funnel')
const mergeTrees = require('broccoli-merge-trees')
const writeFile = require('broccoli-file-creator')

function reorderForCompatibility(languages) {
	let index = languages.findIndex(function(lang) {
		return lang === 'cpp'
	})
	let removed = languages.splice(index, 1)
	languages.unshift(removed[0])
	return languages
}

const DEFAULT_STYLE = 'tomorrow-night-eighties'

module.exports = {
	name: 'ember-code-block',

	included(app) {
		this._super.included && this._super.included.apply(this, arguments)
		let target = findTargetHost(this, app)
		this.app = app

		let config = app.project.config(app.env) || {}
		let addonConfig = config[this.name] || {}

		if (!Array.isArray(addonConfig.languages)) {
			this.ui.writeError(
				`[${
					this.name
				}] Languages configuration is invalid, please specify a list of languages to load from highlight.js as languages: ['javascript', 'xml', 'json']`,
			)
			return
		}

		addonConfig = {
			style: addonConfig.style || DEFAULT_STYLE,
			languages: [...(addonConfig.languages || ['javascript'])],
		}

		// Ensures we include the CPP language first if used
		this.languages = reorderForCompatibility(addonConfig.languages)

		if (addonConfig.style.endsWith('.css')) {
			addonConfig.style = path.basename(addonConfig.style)
		}

		this.style = addonConfig.style

		// 1. Import highlight.js
		target.import(path.posix.join('vendor', 'highlight', 'highlight.js'), {
			using: [{ transformation: 'amd', as: 'highlight' }],
		})

		// 2. Import each language specified in config
		this.languages.forEach(function(language) {
			target.import(path.posix.join('vendor', 'highlight', `${language}.js`), {
				using: [{ transformation: 'cjs', as: `highlight/${language}` }],
			})
		})

		// 3. Import stylesheet
		app.import('highlight/styles.css')

		// 4. Register languages with hljs
		app.import('vendor/register-hljs-languages.js')
	},

	treeForVendor() {
		let registerFile = writeFile(
			'register-hljs-languages.js',
			`
let Highlight = require('highlight');
${this.languages
				.map(lang => `Highlight.registerLanguage('${lang}', require('highlight/${lang}'));`)
				.join('\n')}
`,
		)
		let trees = [this.highlightTree(), this.languagesTree(this.languages), registerFile]

		return mergeTrees(trees)
	},

	treeForStyles() {
		try {
			let pathToStyle = resolveSync('highlight.js/styles/' + this.style + '.css')
			let dir = path.dirname(pathToStyle)
			let styleFile = path.basename(pathToStyle)

			return new Funnel(dir, {
				files: [styleFile],
				getDestinationPath: () => '/highlight/styles.css',
				annotation: `Funnel: highlight.js ${styleFile}`,
			})
		} catch (err) {
			this.ui.writeError(`[ember-code-block] ${err.message}`)
			return null
		}
	},

	languagesTree(languages) {
		let files = languages.map(language => {
			let pathToLanguage = resolveSync(`highlight.js/lib/languages/${language}.js`)
			let dir = path.dirname(pathToLanguage)
			let name = path.basename(pathToLanguage)
			return { pathToLanguage, dir, name }
		})

		if (files.length === 0) {
			this.ui.writeWarnLine('[ember-code-block] No languages configured to load')
			return []
		}

		return new Funnel(files[0].dir, {
			files: files.map(file => file.name),
			destDir: 'highlight',
			annotation: `Funnel: highlight.js languages: ${languages.join(', ')}`,
		})
	},

	highlightTree() {
		let resolvedPath = resolveSync('highlight.js/lib/highlight.js')
		let dir = path.dirname(resolvedPath)
		let name = path.basename(resolvedPath)

		let tree = new Funnel(dir, {
			files: [name],
			destDir: `highlight`,
			annotation: `Funnel: highlight.js`,
		})

		return tree
	},
}

function findTargetHost(addon, app) {
	let target = app

	if (typeof addon.import === 'function') {
		target = addon
	} else {
		// If the addon has the _findHost() method (in ember-cli >= 2.7.0), we'll just
		// use that.
		if (typeof addon._findHost === 'function') {
			target = addon._findHost()
		}

		// Otherwise, we'll use this implementation borrowed from the _findHost()
		// method in ember-cli.
		// Keep iterating upward until we don't have a grandparent.
		// Has to do this grandparent check because at some point we hit the project.
		let current = addon
		do {
			target = current.app || app
		} while (current.parent.parent && (current = current.parent))
	}

	return target
}

function resolveSync(name) {
	return require('resolve').sync(name)
}
