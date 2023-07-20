import { type MarbleApi } from '@app-builder/infra/marble-api';
import { adaptFormulaDto, type AstNode } from '@app-builder/models';

export type ScenarioRepository = ReturnType<typeof getScenarioRepository>;

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

export function getScenarioRepository() {
  return (marbleApiClient: MarbleApi) => ({
    getScenarioIterationRule: async ({ ruleId }: { ruleId: string }) => {
      const { formula, ...rule } =
        await marbleApiClient.getScenarioIterationRule(ruleId);

      const astNode = adaptFormulaDto(formula);

      const orAndGroupAstNode = isOrAndGroup(astNode)
        ? astNode
        : wrapInOrAndGroups(astNode);

      return { ...rule, astNode: orAndGroupAstNode };
    },
  });
}
