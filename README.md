# ember-code-block

Simple, effective, and customizable code highlighting for Ember using highlight.js

# Usage

```js
let code = `
<html>
  <body>
    <ul></ul>
  </body>
</html>`
```

```hbs
{{code-block code language="html"}}
```

## Installation

```
ember install ember-code-block
```

# Selecting Languages

Highlight.js comes with over 160 language packs, but in practice you'll probably
only want to use a handfull. By default this addon won't include any languages in the build to keep it small, instead you must register a language by configuring this addon in your app's environment:

```js
ENV['ember-code-block'] = {
	languages: ['json', 'handlebars', 'javascript'],
}
```

See [all available languages](Languages.md)

You will probably want to also configure the `style` (a.k.a theme):

```js
ENV['ember-code-block'] = {
	style: 'tomorrow-night-eighties',
}
```

Due to the way the CSS works, you can only load one theme at a time, so you need
to configure this on load. This is a limitation of `highlight.js`.

## Running

* `ember serve`
* Visit your app at http://localhost:4200.

## Running Tests

* `npm test` (Runs `ember try:testall` to test your addon against multiple Ember versions)
* `ember test`
* `ember test --server`

## Building

* `ember build`

For more information on using ember-cli, visit [http://ember-cli.com/](http://ember-cli.com/).
