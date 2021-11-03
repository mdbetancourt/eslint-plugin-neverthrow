import { TypeChecker } from 'typescript';
import { unionTypeParts } from 'tsutils';
import { TSESTree } from '@typescript-eslint/types';
import {
  AST_NODE_TYPES,
  TSESLint,
  ParserServices,
} from '@typescript-eslint/experimental-utils';
import { MessageIds } from '../utils';

function matchAny(nodeTypes: AST_NODE_TYPES[]) {
  return `:matches(${nodeTypes.join(', ')})`;
}
const resultSelector = matchAny([
  // AST_NODE_TYPES.Identifier,
  AST_NODE_TYPES.CallExpression,
  AST_NODE_TYPES.NewExpression,
]);

const resultProperties = [
  'isOk',
  'isErr',
  'mapErr',
  'map',
  'andThen',
  'orElse',
  'match',
  'unwrapOr',
];

const handledMethods = ['match', 'unwrapOr', '_unsafeUnwrap'];

// evalua dentro de la expresion si es result
// si es result chequea que sea manejada en el la expresion
// si no es manejada revisa si es asignada o usada como argumento para una funcion
// si fue asignada sin manejar revisa todo el bloque de la variable por manejos
// de resto fue manejada adecuadamente

function isResultLike(
  checker: TypeChecker,
  parserServices: ParserServices,
  node?: TSESTree.Node | null
): boolean {
  if (!node) return false;
  const tsNodeMap = parserServices.esTreeNodeToTSNodeMap.get(node);
  const type = checker.getTypeAtLocation(tsNodeMap);

  for (const ty of unionTypeParts(checker.getApparentType(type))) {
    if (
      resultProperties
        .map((p) => ty.getProperty(p))
        .every((p) => p !== undefined)
    ) {
      return true;
    }
  }
  return false;
}

function findMemberName(node?: TSESTree.MemberExpression): string | null {
  if (!node) return null;
  if (node.property.type !== AST_NODE_TYPES.Identifier) return null;

  return node.property.name;
}

function isMemberCalledFn(node?: TSESTree.MemberExpression): boolean {
  if (node?.parent?.type !== AST_NODE_TYPES.CallExpression) return false;
  return node.parent.callee === node;
}

function isHandledResult(node: TSESTree.Node): boolean {
  const memberExpresion = node.parent;
  if (memberExpresion?.type === AST_NODE_TYPES.MemberExpression) {
    const methodName = findMemberName(memberExpresion);
    const methodIsCalled = isMemberCalledFn(memberExpresion);
    if (methodName && handledMethods.includes(methodName) && methodIsCalled) {
      return true;
    }
    const parent = node.parent?.parent; // search for chain method .map().handler
    if (parent && parent?.type !== AST_NODE_TYPES.ExpressionStatement) {
      return isHandledResult(parent);
    }
  }
  return false;
}
const endTransverse = [AST_NODE_TYPES.BlockStatement, AST_NODE_TYPES.Program];
function getAssignation(
  checker: TypeChecker,
  parserServices: ParserServices,
  node: TSESTree.Node
): TSESTree.Identifier | undefined {
  if (
    node.type === AST_NODE_TYPES.VariableDeclarator &&
    isResultLike(checker, parserServices, node.init) &&
    node.id.type === AST_NODE_TYPES.Identifier
  ) {
    return node.id;
  }
  if (endTransverse.includes(node.type) || !node.parent) {
    return undefined;
  }
  return getAssignation(checker, parserServices, node.parent);
}

function isReturned(
  checker: TypeChecker,
  parserServices: ParserServices,
  node: TSESTree.Node
): boolean {
  if (node.type === AST_NODE_TYPES.ReturnStatement) {
    return true;
  }
  if (node.type === AST_NODE_TYPES.BlockStatement) {
    return false;
  }
  if (node.type === AST_NODE_TYPES.Program) {
    return false;
  }
  if (!node.parent) {
    return false;
  }
  return isReturned(checker, parserServices, node.parent);
}

const ignoreParents = [
  AST_NODE_TYPES.ClassDeclaration,
  AST_NODE_TYPES.FunctionDeclaration,
  AST_NODE_TYPES.MethodDefinition,
  AST_NODE_TYPES.ClassProperty,
];

function processSelector(
  context: TSESLint.RuleContext<MessageIds, []>,
  checker: TypeChecker,
  parserServices: ParserServices,
  node: TSESTree.Node,
  reportAs = node
): boolean {
  if (node.parent?.type.startsWith('TS')) {
    return false;
  }
  if (node.parent && ignoreParents.includes(node.parent.type)) {
    return false;
  }
  if (!isResultLike(checker, parserServices, node)) {
    return false;
  }

  if (isHandledResult(node)) {
    return false;
  }
  // return getResult()
  if (isReturned(checker, parserServices, node)) {
    return false;
  }

  const assignedTo = getAssignation(checker, parserServices, node);
  const currentScope = context.getScope();

  // Check if is assigned
  if (assignedTo) {
    const variable = currentScope.set.get(assignedTo.name);
    const references =
      variable?.references.filter((ref) => ref.identifier !== assignedTo) ?? [];
    if (references.length > 0) {
      return references.some((ref) =>
        processSelector(
          context,
          checker,
          parserServices,
          ref.identifier,
          currentScope.block
        )
      );
    }
  }

  context.report({
    node: reportAs,
    messageId: MessageIds.MUST_USE,
  });
  return true;
}

const rule: TSESLint.RuleModule<MessageIds, []> = {
  meta: {
    docs: {
      description:
        'Not handling neverthrow result is a possible error because errors could remain unhandleds.',
      category: 'Possible Errors',
      recommended: 'error',
      url: '',
    },
    messages: {
      mustUseResult:
        'Result must be handle with either of match, unwrapOr or _unsafeUnwrap.',
    },
    schema: [],
    type: 'problem',
  },

  create(context) {
    const parserServices = context.parserServices;
    const checker = parserServices?.program?.getTypeChecker();

    if (!checker || !parserServices) {
      throw Error(
        'types not available, maybe you need set the parser to @typescript-eslint/parser'
      );
    }

    return {
      [resultSelector](node: TSESTree.Node) {
        return processSelector(context, checker, parserServices, node);
      },
    };
  },
};

export = rule;
