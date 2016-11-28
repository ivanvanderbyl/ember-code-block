/* eslint "no-var":off, "ember-suave/prefer-destructuring":off */

var recast = require('recast');
var types = recast.types;
var namedTypes = types.namedTypes;
var b = recast.types.builders;

function buildExportDefaultDefinition(packageName, deps, node) {
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

function getDependenciesForDefine(node) {
  if (namedTypes.CallExpression.check(node)) {
    return node.arguments[0].elements.map(function(e) {
      return e.value;
    });
  } else {
    return [];
  }
}

function isHighlightJSFunctionBody(node) {
  return namedTypes.FunctionExpression.check(node)
    && node.id === null
    && !!node.params
    && namedTypes.Identifier.check(node.params[0])
    && node.params[0].name === 'hljs';
}

function replaceHighlightJSInitializer(path) {
  var hljs = b.variableDeclaration('var', [
    b.variableDeclarator(
      b.identifier('hljs'),
      b.objectExpression([])
    )
  ]);

  var block = path.node.body.body;

  block.unshift(hljs);

  return b.functionExpression(
    null,
    [],
    b.blockStatement(block)
  );
}

/**
 * @public
 *
 * A custom rewriter to transform the generic hljs factory to an Ember specific
 * AMD definition.
 *
 * @return {String} The rewritten source code
 */
module.exports = function rewriteAMDFunction(code, packageName) {
  var ast = recast.parse(code);
  var amdFunctionBody;

  types.visit(ast, {
    visitFunctionExpression(path) {
      if (isHighlightJSFunctionBody(path.node)) {
        amdFunctionBody = replaceHighlightJSInitializer(path);
      }

      this.traverse(path);
    }
  });

  ast = buildExportDefaultDefinition(packageName, [], amdFunctionBody);
  return recast.print(ast).code;
};
