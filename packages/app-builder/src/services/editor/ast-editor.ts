import {
  adaptValidation,
  type AstNode,
  type AstOperator,
  type ConstantType,
  type EditorIdentifiersByType,
  type NodeEvaluation,
  type Validation,
} from '@app-builder/models';
import { nanoid } from 'nanoid';
import { useCallback, useEffect, useState } from 'react';
import * as R from 'remeda';

// TODO: trancher entre Builder vs Editor
export interface EditorNodeViewModel {
  nodeId: string;
  funcName: string | null;
  constant?: ConstantType;
  validation: Validation;
  children: EditorNodeViewModel[];
  namedChildren: Record<string, EditorNodeViewModel>;
}

function adaptEditorNodeViewModel({
  ast,
  validation,
}: {
  ast: AstNode;
  validation?: NodeEvaluation;
}): EditorNodeViewModel {
  const evaluation = validation
    ? validation
    : {
        returnValue: null,
        errors: null,
        children: [],
        namedChildren: {},
      };

  return {
    nodeId: nanoid(),
    funcName: ast.name,
    constant: ast.constant,
    validation: adaptValidation(evaluation),
    children: ast.children.map((child, i) =>
      adaptEditorNodeViewModel({
        ast: child,
        validation: evaluation.children[i],
      })
    ),
    namedChildren: R.mapValues(ast.namedChildren, (child, namedKey) =>
      adaptEditorNodeViewModel({
        ast: child,
        validation: evaluation.namedChildren[namedKey],
      })
    ),
  };
}

// adapt ast node from editor view model
export function adaptAstNodeFromEditorViewModel(
  vm: EditorNodeViewModel
): AstNode {
  return {
    name: vm.funcName,
    constant: vm.constant,
    children: vm.children.map(adaptAstNodeFromEditorViewModel),
    namedChildren: R.mapValues(
      vm.namedChildren,
      adaptAstNodeFromEditorViewModel
    ),
  };
}

export interface AstBuilder {
  astViewModel: EditorNodeViewModel;
  identifiers: EditorIdentifiersByType;
  operators: AstOperator[];
  setConstant(nodeId: string, newValue: ConstantType): void;
  setOperand(nodeId: string, operandAst: AstNode): void;
  setOperator(nodeId: string, name: string): void;
  appendChild(nodeId: string, childAst: AstNode): void;
  remove(nodeId: string): void;
  save(): void;
}

export function useAstBuilder({
  ast,
  validation,
  identifiers,
  operators,
  onSave,
}: {
  ast: AstNode;
  validation: NodeEvaluation;
  identifiers: EditorIdentifiersByType;
  operators: AstOperator[];
  onSave: (toSave: AstNode) => void;
}): AstBuilder {
  const [astViewModel, setAstViewModel] = useState<EditorNodeViewModel>(() =>
    adaptEditorNodeViewModel({ ast, validation })
  );

  // VERY TEMTO
  useEffect(() => {
    setAstViewModel(adaptEditorNodeViewModel({ ast, validation }));
  }, [ast, validation]);

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
        constant: newValue,
      }));

      // Todo: debonced save
    },
    [replaceOneNode]
  );

  const setOperand = useCallback(
    (nodeId: string, operandAst: AstNode) => {
      // Todo: edit view
      replaceOneNode(nodeId, () => {
        const newOperand = adaptEditorNodeViewModel({
          ast: operandAst,
        });

        return newOperand;
      });

      // Todo: debonced save
    },
    [replaceOneNode]
  );

  const setOperator = useCallback(
    (nodeId: string, funcName: string) => {
      // Todo: edit view
      replaceOneNode(nodeId, (node) => {
        return {
          ...node,
          funcName,
        };
      });

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

  const save = useCallback(() => {
    onSave(adaptAstNodeFromEditorViewModel(astViewModel));

    // Todo: debonced save
  }, [astViewModel, onSave]);

  return {
    astViewModel,
    identifiers,
    operators,
    setConstant,
    setOperand,
    setOperator,
    appendChild,
    remove,
    save,
  };
}
