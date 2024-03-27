import {
  type AstNode,
  type DatabaseAccessAstNode,
  type PayloadAstNode,
  type TableModel,
} from '@app-builder/models';
import { type OperatorFunctions } from '@app-builder/models/editable-operators';
import { type EditorNodeViewModel } from '@app-builder/services/editor/ast-editor';
import { CopyPasteASTContextProvider } from '@app-builder/services/editor/copy-paste-ast';
import { type CustomList } from 'marble-api';

import { AggregationEditModal } from './AstBuilderNode/AggregationEdit';
import { TimeAddEditModal } from './AstBuilderNode/TimeAddEdit/Modal';
import { RootAstBuilderNode } from './RootAstBuilderNode';

interface AstBuilderProps {
  input: {
    databaseAccessors: DatabaseAccessAstNode[];
    payloadAccessors: PayloadAstNode[];
    operators: OperatorFunctions[];
    dataModel: TableModel[];
    customLists: CustomList[];
    triggerObjectTable: TableModel;
  };
  setOperand: (nodeId: string, operandAst: AstNode) => void;
  setOperator: (nodeId: string, name: string) => void;
  appendChild: (nodeId: string, childAst: AstNode) => void;
  remove: (nodeId: string) => void;
  editorNodeViewModel: EditorNodeViewModel;
  viewOnly?: boolean;
}

export function AstBuilder({
  input,
  setOperand,
  setOperator,
  appendChild,
  remove,
  editorNodeViewModel,
  viewOnly,
}: AstBuilderProps) {
  return (
    <CopyPasteASTContextProvider>
      <TimeAddEditModal
        input={{
          databaseAccessors: input.databaseAccessors,
          payloadAccessors: input.payloadAccessors,
          dataModel: input.dataModel,
          triggerObjectTable: input.triggerObjectTable,
        }}
      >
        <AggregationEditModal
          input={{
            databaseAccessors: input.databaseAccessors,
            payloadAccessors: input.payloadAccessors,
            dataModel: input.dataModel,
            customLists: input.customLists,
            triggerObjectTable: input.triggerObjectTable,
          }}
        >
          <RootAstBuilderNode
            input={input}
            setOperand={setOperand}
            setOperator={setOperator}
            appendChild={appendChild}
            remove={remove}
            editorNodeViewModel={editorNodeViewModel}
            viewOnly={viewOnly}
          />
        </AggregationEditModal>
      </TimeAddEditModal>
    </CopyPasteASTContextProvider>
  );
}
