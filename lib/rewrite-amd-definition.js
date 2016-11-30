/* eslint "no-var":off, "ember-suave/prefer-destructuring":off */

var recast = require('recast');
var types = recast.types;
var namedTypes = types.namedTypes;
var b = recast.types.builders;

function buildExportDefaultDefinition(packageName, deps, node) {
  if (deps[0] !== 'exports') {
    deps.unshift('exports');
  }

  return b.expressionStatement(
    b.callExpression(
      b.identifier('define'), [
        b.literal(packageName),
        b.arrayExpression(deps.map(function(name) {
          return b.literal(name);
        })),

        node
      ]
    )
  );
}

function isHighlightJSFunctionBody(node) {
  return namedTypes.FunctionExpression.check(node)
    && node.id === null
    && !!node.params
    && namedTypes.Identifier.check(node.params[0])
    && node.params[0].name === 'hljs';
}

function replaceHighlightJSInitializer(path, languages) {
  var hljs = b.variableDeclaration('var', [
    b.variableDeclarator(
      b.identifier('hljs'),
      b.objectExpression([])
    )
  ]);

  var factory = b.variableDeclaration('var', [
    b.variableDeclarator(
      b.identifier('factory'),
      path.node
    )
  ]);

  let langStatement = languages.map(function(language) {
    return b.expressionStatement(
      b.callExpression(
        b.memberExpression(b.identifier('hljs'), b.identifier('registerLanguage')),
        [
          b.literal(language.name),
          b.memberExpression(
            b.identifier(language.variable),
            b.identifier('default')
          )
        ])
      );
  });

  let params = [b.identifier('exports')].concat(languages.map(function(lang) {
    return b.identifier(lang.variable);
  }));

  let defineBlock = b.functionExpression(
    null,
    params,
    b.blockStatement([
      hljs,
      factory,
      b.assignmentStatement('=', b.identifier('exports.default'),
        b.callExpression(b.identifier('factory'), [b.identifier('hljs')])
      )
    ].concat(langStatement))
  );

  return defineBlock;
}

/**
 * @public
 *
 * A custom rewriter to transform the generic hljs factory to an Ember specific
 * AMD definition.
 *
 * @return {String} The rewritten source code
 */
module.exports = function rewriteAMDFunction(code, packageName, options) {
  let languages = options.languages || [];
  var ast = recast.parse(code);
  var amdFunctionBody;

  types.visit(ast, {
    visitFunctionExpression(path) {
      if (isHighlightJSFunctionBody(path.node)) {
        amdFunctionBody = replaceHighlightJSInitializer(path, languages);
      }

      this.traverse(path);
    }
  });

  let languageDeps = languages.map(function(language) {
    return `highlight/languages/${language.name}`;
  });

  ast = buildExportDefaultDefinition(packageName, languageDeps, amdFunctionBody);
  // console.log(recast.print(ast).code);
  return recast.print(ast).code;
};
