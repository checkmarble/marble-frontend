import { type AstNode, type IdLessAstNode } from '@app-builder/models';
import { type FlatNodeEvaluation } from '@app-builder/routes/ressources+/scenarios+/$scenarioId+/validate-ast';
import { getAtPath, getParentPath, parsePath } from '@app-builder/utils/tree';
import { type AstBuilderValidationFn } from '@ast-builder/Provider';
import { clone } from 'remeda';
import { createSharpFactory, type InferSharpApi } from 'sharpstate';
import { match, P } from 'ts-pattern';

export type AstBuilderNodeStoreValue = {
  node: AstNode;
  evaluation: FlatNodeEvaluation[];
  copiedNode: IdLessAstNode | null;
  validationFn: AstBuilderValidationFn;
};

export const AstBuilderNodeSharpFactory = createSharpFactory({
  name: 'AstBuilderNode',
  initializer({
    initialNode,
    initialEvaluation,
    validationFn,
  }: {
    initialNode: AstNode;
    initialEvaluation: FlatNodeEvaluation[];
    validationFn: AstBuilderValidationFn;
  }): AstBuilderNodeStoreValue {
    return { node: initialNode, evaluation: initialEvaluation, copiedNode: null, validationFn };
  },
}).withActions({
  setNodeAtPath(api, path: string, newNode: AstNode) {
    const parentPath = getParentPath(parsePath(path));
    if (!parentPath) {
      api.value.node = newNode;
    } else {
      const parentNode = getAtPath(api.value.node, parentPath.path);
      if (!parentNode) {
        return;
      }

      match(parentPath.childPathSegment)
        .with({ type: 'children', index: P.select() }, (index) => {
          parentNode.children[index] = newNode;
        })
        .with({ type: 'namedChildren', key: P.select() }, (key) => {
          parentNode.namedChildren[key] = newNode;
        })
        .exhaustive();
    }
  },
  async validate(api) {
    try {
      const evaluation = await api.value.validationFn(api.value.node);
      api.batch(() => {
        // TODO: Manage diff to optimize render
        // applyEvaluation(api.value.evaluation, evaluation);
        api.value.evaluation = evaluation;
      });
    } catch (err) {
      if (err === 'VALIDATION_ABORTED') {
        return;
      }
      throw err;
    }
  },
  copyNode(api, node: IdLessAstNode) {
    api.value.copiedNode = clone(node);
  },
});

export type AstBuilderNodeStore = InferSharpApi<typeof AstBuilderNodeSharpFactory>;
