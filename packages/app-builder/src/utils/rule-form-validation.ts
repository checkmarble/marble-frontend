import { type AstNode, isUndefinedAstNode } from '@app-builder/models';
import { isAndAstNode, isMainAstBinaryNode, isOrWithAndAstNode } from '@app-builder/models/astNode/builder-ast-node';
import { isBinaryMainAstOperatorFunction } from '@app-builder/models/astNode/builder-ast-node-node-operator';
import { isStringConcatAstNode } from '@app-builder/models/astNode/strings';

function isFilledOperand(node: AstNode): boolean {
  if (isUndefinedAstNode(node)) {
    return false;
  }
  if (isStringConcatAstNode(node)) {
    return (node.children ?? []).some((child) => isFilledOperand(child));
  }
  return true;
}

function isFilledRuleCondition(node: AstNode): boolean {
  if (!isMainAstBinaryNode(node)) {
    return false;
  }
  if (!isBinaryMainAstOperatorFunction(node.name)) {
    return false;
  }
  return node.children.length === 2 && node.children.every((child) => isFilledOperand(child));
}

/** True when the rule formula AST has at least one complete if-condition in the builder. */
export function hasFilledRuleFormula(formula: AstNode | null | undefined): boolean {
  if (formula == null) {
    return false;
  }
  if (isOrWithAndAstNode(formula)) {
    return formula.children.some((andGroup) => andGroup.children.some((child) => isFilledRuleCondition(child)));
  }
  if (isAndAstNode(formula)) {
    return formula.children.some((child) => isFilledRuleCondition(child));
  }
  return isFilledRuleCondition(formula);
}
