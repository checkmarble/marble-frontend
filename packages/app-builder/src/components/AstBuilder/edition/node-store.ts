import { type AstNode, type IdLessAstNode } from '@app-builder/models';
import { type FlatAstValidation } from '@app-builder/routes/ressources+/scenarios+/$scenarioId+/validate-ast';
import { getAtPath, getParentPath, parsePath } from '@app-builder/utils/tree';
import { clone } from 'remeda';
import { createSharpFactory, type InferSharpApi } from 'sharpstate';
import { match, P } from 'ts-pattern';

export type AstBuilderValidationFn = (node: AstNode) => Promise<FlatAstValidation>;
export type AstBuilderUpdateFn = (node: AstNode) => void;

export type AstBuilderNodeStoreValue = {
  node: AstNode;
  validation: FlatAstValidation;
  copiedNode: IdLessAstNode | null;
  validationFn: AstBuilderValidationFn;
  updateFn?: AstBuilderUpdateFn;
};

export const AstBuilderNodeSharpFactory = createSharpFactory({
  name: 'AstBuilderNode',
  initializer({
    initialNode,
    initialValidation,
    validationFn,
    updateFn,
  }: {
    initialNode: AstNode;
    initialValidation: FlatAstValidation;
    validationFn: AstBuilderValidationFn;
    updateFn?: AstBuilderUpdateFn;
  }): AstBuilderNodeStoreValue {
    return {
      node: clone(initialNode),
      validation: initialValidation,
      copiedNode: null,
      validationFn,
      updateFn,
    };
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
    api.value.updateFn?.(clone(api.value.node));
  },
  async validate(api) {
    try {
      const evaluation = await api.value.validationFn(api.value.node);
      api.batch(() => {
        // TODO: Manage diff to optimize render
        // applyEvaluation(api.value.evaluation, evaluation);
        api.value.validation = evaluation;
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
  triggerUpdate(api) {
    api.value.updateFn?.(clone(api.value.node));
  },
});

export type AstBuilderNodeStore = InferSharpApi<typeof AstBuilderNodeSharpFactory>;
