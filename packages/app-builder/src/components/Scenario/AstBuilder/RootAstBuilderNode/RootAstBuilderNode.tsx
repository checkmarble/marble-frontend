import {
  type AstNode,
  type DatabaseAccessAstNode,
  type PayloadAstNode,
  type TableModel,
} from '@app-builder/models';
import { type OperatorFunctions } from '@app-builder/models/editable-operators';
import { type EditorNodeViewModel } from '@app-builder/services/editor/ast-editor';
import { type CustomList } from 'marble-api';

import { AstBuilderNode } from '../AstBuilderNode';
import { adaptRootAndViewModel, RootAnd } from './RootAnd';
import { adaptRootOrWithAndViewModel, RootOrWithAnd } from './RootOrWithAnd';

interface RootAstBuilderNodeProps {
  input: {
    databaseAccessors: DatabaseAccessAstNode[];
    payloadAccessors: PayloadAstNode[];
    dataModel: TableModel[];
    customLists: CustomList[];
    triggerObjectTable: TableModel;
    operators: OperatorFunctions[];
  };
  setOperand: (nodeId: string, operandAst: AstNode) => void;
  setOperator: (nodeId: string, name: string) => void;
  appendChild: (nodeId: string, childAst: AstNode) => void;
  remove: (nodeId: string) => void;
  editorNodeViewModel: EditorNodeViewModel;
  viewOnly?: boolean;
}

/**
 * Specific Root node that can address the case of a root And node or a root Or node with And children.
 *
 * This is necessary to avoid the recursive call of AstBuilderNode that could trigger a root specific layout for any child node.
 */
export function RootAstBuilderNode({
  input,
  setOperand,
  setOperator,
  appendChild,
  remove,
  editorNodeViewModel,
  viewOnly,
}: RootAstBuilderNodeProps) {
  const rootOrWithAndViewModel =
    adaptRootOrWithAndViewModel(editorNodeViewModel);
  if (rootOrWithAndViewModel) {
    return (
      <RootOrWithAnd
        input={input}
        setOperand={setOperand}
        setOperator={setOperator}
        appendChild={appendChild}
        remove={remove}
        rootOrWithAndViewModel={rootOrWithAndViewModel}
        viewOnly={viewOnly}
      />
    );
  }

  const rootAndViewModel = adaptRootAndViewModel(editorNodeViewModel);
  if (rootAndViewModel) {
    return (
      <RootAnd
        input={input}
        setOperand={setOperand}
        setOperator={setOperator}
        appendChild={appendChild}
        remove={remove}
        rootAndViewModel={rootAndViewModel}
        viewOnly={viewOnly}
      />
    );
  }

  // Fallback to the generic AstBuilderNode
  return (
    <AstBuilderNode
      editorNodeViewModel={editorNodeViewModel}
      input={input}
      setOperand={setOperand}
      setOperator={setOperator}
      viewOnly={viewOnly}
      root
    />
  );
}
