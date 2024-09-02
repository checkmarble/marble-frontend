import {
  type AstNode,
  type DatabaseAccessAstNode,
  type DataModel,
  type PayloadAstNode,
} from '@app-builder/models';
import { type CustomList } from '@app-builder/models/custom-list';
import { type OperatorFunction } from '@app-builder/models/editable-operators';
import { OptionsProvider } from '@app-builder/services/ast-node/options';
import { type EditorNodeViewModel } from '@app-builder/services/editor/ast-editor';
import { CopyPasteASTContextProvider } from '@app-builder/services/editor/copy-paste-ast';

import { AggregationEditModal } from './AstBuilderNode/AggregationEdit';
import { FuzzyMatchComparatorEditModal } from './AstBuilderNode/FuzzyMatchComparatorEdit/Modal';
import { TimeAddEditModal } from './AstBuilderNode/TimeAddEdit/Modal';
import { RootAstBuilderNode } from './RootAstBuilderNode';

interface AstBuilderProps {
  options: {
    databaseAccessors: DatabaseAccessAstNode[];
    payloadAccessors: PayloadAstNode[];
    operators: OperatorFunction[];
    dataModel: DataModel;
    customLists: CustomList[];
    triggerObjectType: string;
  };
  setOperand: (nodeId: string, operandAst: AstNode) => void;
  setOperator: (nodeId: string, name: string) => void;
  appendChild: (nodeId: string, childAst: AstNode) => void;
  remove: (nodeId: string) => void;
  editorNodeViewModel: EditorNodeViewModel;
  viewOnly?: boolean;
}

export function AstBuilder({
  options,
  setOperand,
  setOperator,
  appendChild,
  remove,
  editorNodeViewModel,
  viewOnly,
}: AstBuilderProps) {
  return (
    <OptionsProvider {...options}>
      <CopyPasteASTContextProvider>
        <TimeAddEditModal>
          <AggregationEditModal>
            <FuzzyMatchComparatorEditModal>
              <AggregationEditModal>
                <RootAstBuilderNode
                  setOperand={setOperand}
                  setOperator={setOperator}
                  appendChild={appendChild}
                  remove={remove}
                  editorNodeViewModel={editorNodeViewModel}
                  viewOnly={viewOnly}
                />
              </AggregationEditModal>
            </FuzzyMatchComparatorEditModal>
          </AggregationEditModal>
        </TimeAddEditModal>
      </CopyPasteASTContextProvider>
    </OptionsProvider>
  );
}
