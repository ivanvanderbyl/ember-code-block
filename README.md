# ember-code-block

Simple, effective, and customizable code highlighting for Ember.

# Usage

```js
let code = `
<html>
  <body>
    <ul></ul>
  </body>
</html>`;
```

```hbs
{{code-block code language="html"}}
```

## Installation

* `git clone` this repository
* `npm install`
* `bower install`

# Svelte Builds

Highlight.js comes with over 160 language packs, but in practice you'll probably
only want to use a handfull. You can exclude which packs are loaded by specifying
either `exclude` or `only` options on the `ember-code-block` config within your
app's environment:

```js
ENV['ember-code-block'] = {
  languages: {
    only: ['json', 'handlebars', 'js']
  }
};
```

You will probably want to also configure the `style` (a.k.a theme):

```js
ENV['ember-code-block'] = {
  languages: {
    only: ['json', 'handlebars', 'js']
  },

  style: 'tomorrow-night-eighties'
};
```

Due to the way the CSS works, you can only load one theme at a time, so you need
to configure this on load. This is a limitation of `highlight.js`.

## Under the hood

Okay so you've probably looked at the files in this addon and scratched your head,
wondering what the heck is with all the custom rewriters, loaders, and vendored
trees. 

Well, there's a fine story to tell here. Since we're using `ember-cli`, and this
is an addon which loads files from a third-party NPM package, there's a couple of 
things we need to do so that Ember can understand it.

Firstly, the original highlight.js NPM module is suited to being loaded by NodeJS,
so it defines standard CommonJS modules. Unfortunately Ember doesn't support reading
these by default, so we need to convert them to a subset of AMD which Ember uses.

We do this in a very specific way, first we convert the main `highlight.js` engine
to `highlight`, an AMD module which exports a default of the core highlight module.

This allows us to use the standard ES6 loaders in Ember, so we can `import Highlight from "highlight"`
and it works exactly as we expect.

The problem here is that we haven't yet loaded any language packs, so to do that 
we need to 

1. convert each language to AMD, 
2. call `Highlight.registerLanguage(...)` for each language.

That second step usually happens automatically in an include supplied by highlight.js,
but we're going to bypass that and append that register call to each AMD package,
so that when they get loaded into the Ember AMD environment, they're automatically
loaded when you first import `"highlight"`.

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
