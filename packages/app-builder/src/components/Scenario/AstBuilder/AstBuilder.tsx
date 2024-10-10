import {
  type AstNode,
  type DatabaseAccessAstNode,
  type DataModel,
  type PayloadAstNode,
} from '@app-builder/models';
import { type AstNodeViewModel } from '@app-builder/models/ast-node-view-model';
import { type CustomList } from '@app-builder/models/custom-list';
import { type OperatorFunction } from '@app-builder/models/editable-operators';
import { CopyPasteASTContextProvider } from '@app-builder/services/editor/copy-paste-ast';
import { OptionsProvider } from '@app-builder/services/editor/options';

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
  astNodeVM: AstNodeViewModel;
  viewOnly?: boolean;
}

export function AstBuilder({
  options,
  setOperand,
  setOperator,
  appendChild,
  remove,
  astNodeVM,
  viewOnly,
}: AstBuilderProps) {
  return (
    <OptionsProvider {...options}>
      <CopyPasteASTContextProvider>
        <RootAstBuilderNode
          setOperand={setOperand}
          setOperator={setOperator}
          appendChild={appendChild}
          remove={remove}
          astNodeVM={astNodeVM}
          viewOnly={viewOnly}
        />
      </CopyPasteASTContextProvider>
    </OptionsProvider>
  );
}
