import {
  type AstNode,
  type ConstantType,
  type EditorIdentifiersByType,
  NewPendingNodeEvaluation,
  type NodeEvaluation,
} from '@app-builder/models';
import { nanoid } from 'nanoid';
import { useCallback, useState } from 'react';
import * as R from 'remeda';

export interface EditorNodeViewModel {
  nodeId: string;
  nodePath: string;
  ast: AstNode;
  validation: NodeEvaluation;
  children: EditorNodeViewModel[];
  namedChildren: Record<string, EditorNodeViewModel>;
}

function adaptEditorNodeViewModel({
  ast,
  validation,
  nodePath,
}: {
  ast: AstNode;
  validation?: NodeEvaluation;
  nodePath: string;
}): EditorNodeViewModel {
  return {
    nodeId: nanoid(),
    nodePath,
    ast,
    validation: validation ?? NewPendingNodeEvaluation(),
    children: ast.children.map((child, i) =>
      adaptEditorNodeViewModel({
        ast: child,
        validation: validation?.children[i],
        nodePath: `${nodePath}.children[${i}]`,
      })
    ),
    namedChildren: R.mapValues(ast.namedChildren, (child, namedKey) =>
      adaptEditorNodeViewModel({
        ast: child,
        validation: validation?.namedChildren[namedKey],
        nodePath: `${nodePath}.namedChildren.${namedKey}`,
      })
    ),
  };
}

export interface AstBuilder {
  astViewModel: EditorNodeViewModel;
  identifiers: EditorIdentifiersByType;
  setConstant(nodeId: string, newValue: ConstantType): void;
  appendChild(nodeId: string, childAst: AstNode): void;
  remove(nodeId: string): void;
}

export function useAstBuilder({
  ast,
  validation,
  identifiers,
}: {
  ast: AstNode;
  validation: NodeEvaluation;
  identifiers: EditorIdentifiersByType;
  onSave: (toSave: AstNode) => Promise<void>;
}): AstBuilder {
  const [astViewModel, setAstViewModel] = useState<EditorNodeViewModel>(() =>
    adaptEditorNodeViewModel({ ast, validation, nodePath: 'root' })
  );

  const replaceOneNode = useCallback(
    (
      nodeId: string,
      fn: (node: EditorNodeViewModel) => EditorNodeViewModel
    ) => {
      function replaceNode(node: EditorNodeViewModel): EditorNodeViewModel {
        if (node.nodeId === nodeId) {
          return fn(node);
        }

        const children = node.children.map(replaceNode);
        const namedChildren = R.mapValues(node.namedChildren, replaceNode);
        return {
          ...node,
          children,
          namedChildren,
        };
      }

      setAstViewModel((astViewModel) => replaceNode(astViewModel));
    },
    []
  );

  const setConstant = useCallback(
    (nodeId: string, newValue: ConstantType) => {
      // Todo: edit view
      replaceOneNode(nodeId, (node) => ({
        ...node,
        ast: {
          ...node.ast,
          constant: newValue,
        },
      }));

      // Todo: debonced save
    },
    [replaceOneNode]
  );

  const appendChild = useCallback(
    (nodeId: string, childAst: AstNode) => {
      // Todo: edit view
      replaceOneNode(nodeId, (node) => {
        const newChild = adaptEditorNodeViewModel({
          ast: childAst,
          nodePath: `${nodeId}.children[${node.children.length}]`,
        });

        return {
          ...node,
          children: [...node.children, newChild],
        };
      });

      // Todo: debonced save
    },
    [replaceOneNode]
  );

  const remove = useCallback((nodeId: string) => {
    function filterNode(node: EditorNodeViewModel): EditorNodeViewModel {
      const children = node.children
        .filter((child) => child.nodeId !== nodeId)
        .map(filterNode);

      const namedChildren = R.pipe(
        R.toPairs(node.namedChildren),
        R.filter(([_, child]) => child.nodeId !== nodeId),
        R.map(([key, child]) => [key, filterNode(child)] as const),
        (pairs) => R.fromPairs(pairs)
      );

      return {
        ...node,
        children,
        namedChildren,
      };
    }

    setAstViewModel((astViewModel) => filterNode(astViewModel));

    // Todo: debonced save
  }, []);

  return {
    astViewModel,
    identifiers,
    setConstant,
    appendChild,
    remove,
  };
}
