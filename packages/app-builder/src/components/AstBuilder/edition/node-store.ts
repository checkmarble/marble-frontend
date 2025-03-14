import { type AstNode, type IdLessAstNode } from '@app-builder/models';
import { type FlatNodeEvaluation } from '@app-builder/routes/ressources+/scenarios+/$scenarioId+/validate-ast';
import { getAtPath, getParentPath, parsePath } from '@app-builder/utils/tree';
import { clone } from 'remeda';
import { createSharpFactory, type InferSharpApi } from 'sharpstate';
import { match, P } from 'ts-pattern';

import { type AstBuilderValidationFn } from '../Provider';

export type AstBuilderNodeStoreValue = {
  node: AstNode;
  evaluation: FlatNodeEvaluation[];
  copiedNode: IdLessAstNode | null;
};

export const AstBuilderNodeSharpFactory = createSharpFactory({
  name: 'AstBuilderNode',
  initializer({
    initialNode,
    initialEvaluation,
  }: {
    initialNode: AstNode;
    initialEvaluation: FlatNodeEvaluation[];
  }): AstBuilderNodeStoreValue {
    return { node: initialNode, evaluation: initialEvaluation, copiedNode: null };
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
  async validate(api, validateFn?: AstBuilderValidationFn) {
    if (validateFn) {
      try {
        const evaluation = await validateFn(api.value.node);
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
    }
  },
  copyNode(api, node: IdLessAstNode) {
    api.value.copiedNode = clone(node);
  },
});

export type AstBuilderNodeStore = InferSharpApi<typeof AstBuilderNodeSharpFactory>;
