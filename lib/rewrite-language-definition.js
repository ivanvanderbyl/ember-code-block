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

        b.functionExpression(
          null,
          [b.identifier('exports'), b.identifier('hljs')],
          b.blockStatement(
            [
              b.assignmentStatement('=', b.identifier('exports.default'), node)
            ]
          )
        )
      ]
    )
  );
}

function isHighlightJSFunctionBody(node) {
  return namedTypes.FunctionExpression.check(node)
    // && node.id === null
    && !!node.params
    && namedTypes.Identifier.check(node.params[0])
    && node.params[0].name === 'hljs';
}

function isModuleExportsDefinition(path) {
  return path.node.name === 'exports'
    && path.parent.type === 'MemberExpression'
    && path.parent.node.name === 'module';
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
        amdFunctionBody = path.node;
      }

      this.traverse(path);
    }
  });

  ast = buildExportDefaultDefinition(packageName, ['highlight'], amdFunctionBody);
  // console.log(recast.print(ast).code);
  return recast.print(ast).code;
};
