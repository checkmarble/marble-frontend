import {
  type DatabaseAccessAstNode,
  type DataModel,
  type PayloadAstNode,
} from '@app-builder/models';
import { type CustomList } from '@app-builder/models/custom-list';
import { type OperatorFunction } from '@app-builder/models/editable-operators';
import {
  type AstEditorStore,
  AstNodeEditorProvider,
} from '@app-builder/services/editor/ast-editor';
import { CopyPasteASTContextProvider } from '@app-builder/services/editor/copy-paste-ast';
import { OptionsProvider } from '@app-builder/services/editor/options';

import { RootAstBuilderNode } from './RootAstBuilderNode/RootAstBuilderNode';

interface AstBuilderProps {
  options: {
    databaseAccessors: DatabaseAccessAstNode[];
    payloadAccessors: PayloadAstNode[];
    operators: OperatorFunction[];
    dataModel: DataModel;
    customLists: CustomList[];
    triggerObjectType: string;
  };
  astEditorStore: AstEditorStore;
  viewOnly?: boolean;
}

export function AstBuilder({
  options,
  viewOnly,
  astEditorStore,
}: AstBuilderProps) {
  return (
    <OptionsProvider {...options}>
      <CopyPasteASTContextProvider>
        <AstNodeEditorProvider store={astEditorStore}>
          <RootAstBuilderNode viewOnly={viewOnly} />
        </AstNodeEditorProvider>
      </CopyPasteASTContextProvider>
    </OptionsProvider>
  );
}
