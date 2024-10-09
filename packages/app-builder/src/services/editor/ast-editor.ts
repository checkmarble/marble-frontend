import { type AstNode, type ConstantType } from '@app-builder/models';
import {
  adaptAstNodeFromViewModel,
  adaptAstNodeViewModel,
  type AstNodeViewModel,
} from '@app-builder/models/ast-node-view-model';
import { type NodeEvaluation } from '@app-builder/models/node-evaluation';
import { findAndReplaceNode } from '@app-builder/utils/tree';
import { useCallback, useEffect, useState } from 'react';
import * as R from 'remeda';
import invariant from 'tiny-invariant';

export interface AstBuilder {
  astNodeVM: AstNodeViewModel;
  setConstant: (nodeId: string, newValue: ConstantType) => void;
  setOperand: (nodeId: string, operandAst: AstNode) => void;
  setOperator: (nodeId: string, name: string) => void;
  appendChild: (nodeId: string, childAst: AstNode) => void;
  remove: (nodeId: string) => void;
}

export function useAstBuilder({
  backendAst,
  backendEvaluation,
  localEvaluation,
  onValidate,
}: {
  backendAst: AstNode;
  backendEvaluation?: NodeEvaluation;
  localEvaluation: NodeEvaluation | null;
  onValidate: (ast: AstNode) => void;
}): AstBuilder {
  const [astNodeVM, setAstNodeVM] = useState<AstNodeViewModel>(() => {
    return adaptAstNodeViewModel({
      ast: backendAst,
      evaluation: backendEvaluation,
    });
  });

  const validate = useCallback(
    (vm: AstNodeViewModel) => {
      const editedAst = adaptAstNodeFromViewModel(vm);
      onValidate(editedAst);
    },
    [onValidate],
  );

  useEffect(() => {
    validate(astNodeVM);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const replaceOneNode = useCallback(
    (
      nodeId: string,
      fn: (node: AstNodeViewModel) => AstNodeViewModel | null,
    ) => {
      const newViewModel = findAndReplaceNode(nodeId, fn, astNodeVM);
      if (newViewModel === null) {
        throw Error("internal error: root node can't be removed");
      }
      // Validate is opaque (depends on external prop onValidate).
      // A setState callback must be pure (no side effects) so we can't do setEditorNodeViewModel(vm => { validate(vm) }).
      // source: https://github.com/facebook/react/issues/22633
      validate(newViewModel);
      setAstNodeVM(newViewModel);
    },
    [astNodeVM, validate],
  );

  const setConstant = useCallback(
    (nodeId: string, newValue: ConstantType) => {
      replaceOneNode(nodeId, (node) => ({
        ...node,
        constant: newValue,
      }));
    },
    [replaceOneNode],
  );

  const setOperand = useCallback(
    (nodeId: string, operandAst: AstNode) => {
      replaceOneNode(nodeId, () => {
        const newOperand = adaptAstNodeViewModel({
          ast: operandAst,
        });

        return newOperand;
      });
    },
    [replaceOneNode],
  );

  const setOperator = useCallback(
    (nodeId: string, name: string) => {
      replaceOneNode(nodeId, (node) => {
        return {
          ...node,
          name,
        };
      });
    },
    [replaceOneNode],
  );

  const appendChild = useCallback(
    (nodeId: string, childAst: AstNode) => {
      replaceOneNode(nodeId, (node) => {
        const newChild = adaptAstNodeViewModel({
          ast: childAst,
        });

        return {
          ...node,
          children: [...node.children, newChild],
        };
      });
    },
    [replaceOneNode],
  );

  const remove = useCallback(
    (nodeId: string) => replaceOneNode(nodeId, () => null),
    [replaceOneNode],
  );

  useEffect(() => {
    if (localEvaluation === null) {
      return;
    }

    setAstNodeVM((vm) => {
      return updateEvaluation({
        astNodeVM: vm,
        evaluation: localEvaluation,
      });
    });
  }, [localEvaluation]);

  return {
    astNodeVM,
    setConstant,
    setOperand,
    setOperator,
    appendChild,
    remove,
  };
}

function updateEvaluation({
  astNodeVM,
  evaluation,
  parent,
}: {
  astNodeVM: AstNodeViewModel;
  evaluation?: NodeEvaluation;
  parent?: AstNodeViewModel;
}): AstNodeViewModel {
  // Ensure validation is consistent with view model (due to children, namedChildren recursion)
  invariant(evaluation, 'validation is required');

  const currentNode: AstNodeViewModel = {
    ...astNodeVM,
    errors: evaluation.errors,
    parent: parent ?? null,
  };
  currentNode.children = astNodeVM.children.map((child, i) => {
    return updateEvaluation({
      astNodeVM: child,
      evaluation: evaluation.children[i],
      parent: currentNode,
    });
  });
  currentNode.namedChildren = R.mapValues(
    astNodeVM.namedChildren,
    (child, namedKey) => {
      return updateEvaluation({
        astNodeVM: child,
        evaluation: evaluation.namedChildren[namedKey],
        parent: currentNode,
      });
    },
  );

  return currentNode;
}
