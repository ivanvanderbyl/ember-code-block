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
{{code-block code language="html" indent=8}}
```

## Installation

* `git clone` this repository
* `npm install`
* `bower install`

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
