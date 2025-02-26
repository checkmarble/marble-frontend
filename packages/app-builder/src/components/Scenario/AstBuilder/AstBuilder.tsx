import { type DataModel } from '@app-builder/models';
import {
  type DatabaseAccessAstNode,
  type PayloadAstNode,
} from '@app-builder/models/astNode/data-accessor';
import { type CustomList } from '@app-builder/models/custom-list';
import {
  type AstEditorStore,
  AstNodeEditorProvider,
} from '@app-builder/services/editor/ast-editor';
import { CopyPasteASTContextProvider } from '@app-builder/services/editor/copy-paste-ast';
import { OptionsProvider } from '@app-builder/services/editor/options';

import { RootAstBuilderNode } from './RootAstBuilderNode/RootAstBuilderNode';

export interface AstBuilderProps {
  options: {
    databaseAccessors: DatabaseAccessAstNode[];
    payloadAccessors: PayloadAstNode[];
    dataModel: DataModel;
    customLists: CustomList[];
    triggerObjectType: string;
  };
  astEditorStore: AstEditorStore;
  viewOnly?: boolean;
}

export function AstBuilder({ options, viewOnly, astEditorStore }: AstBuilderProps) {
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
