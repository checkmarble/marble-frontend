import {
  getMarbleAPIClient,
  type TokenService,
} from '@marble-front/api/marble';
import { adaptFormulaDto, type AstNode } from '@marble-front/models';

export function isOrAndGroup(astNode: AstNode): boolean {
  if (astNode.name !== 'OR') {
    return false;
  }
  for (const child of astNode.children) {
    if (child.name !== 'AND') {
      return false;
    }
  }
  return true;
}

export function wrapInOrAndGroups(astNode: AstNode): AstNode {
  return {
    name: 'OR',
    constant: null,
    children: [
      {
        name: 'AND',
        constant: null,
        children: [astNode],
        namedChildren: {},
      },
    ],
    namedChildren: {},
  };
}

export async function getScenarioIterationRule({
  ruleId,
  tokenService,
  baseUrl,
}: {
  ruleId: string;
  tokenService: TokenService<string>;
  baseUrl: string;
}) {
  const marbleApiClient = getMarbleAPIClient({
    tokenService,
    baseUrl,
  });

  const { formula, ...rule } = await marbleApiClient.getScenarioIterationRule(
    ruleId
  );

  const astNode = adaptFormulaDto(formula);

  const orAndGroupAstNode = isOrAndGroup(astNode)
    ? astNode
    : wrapInOrAndGroups(astNode);

  return { ...rule, astNode: orAndGroupAstNode };
}
