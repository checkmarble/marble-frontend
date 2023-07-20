import { type MarbleApi } from "@app-builder/infra/marble-api";
import { adaptNodeDto, type AstNode } from "@app-builder/models";

export type ScenarioRepository = ReturnType<typeof getScenarioRepository>;

export function isOrAndGroup(astNode: AstNode): boolean {
  if (astNode.name !== "Or") {
    return false;
  }
  for (const child of astNode.children) {
    if (child.name !== "And") {
      return false;
    }
  }
  return true;
}

export function wrapInOrAndGroups(astNode?: AstNode): AstNode {
  return {
    name: "Or",
    constant: null,
    children: [
      {
        name: "And",
        constant: null,
        children: astNode ? [astNode] : [],
        namedChildren: {},
      },
    ],
    namedChildren: {},
  };
}

export function getScenarioRepository() {
  return (marbleApiClient: MarbleApi) => ({
    getScenarioIterationRule: async ({ ruleId }: { ruleId: string }) => {
      const { formula_ast_expression, ...rule } =
        await marbleApiClient.getScenarioIterationRule(ruleId);

      if (!formula_ast_expression) {
        return { ...rule, astNode: wrapInOrAndGroups() };
      }

      const astNode = adaptNodeDto(formula_ast_expression);

      const orAndGroupAstNode = isOrAndGroup(astNode)
        ? astNode
        : wrapInOrAndGroups(astNode);

      return { ...rule, astNode: orAndGroupAstNode };
    },
  });
}
