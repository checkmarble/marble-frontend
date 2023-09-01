import { type DataModel } from '@app-builder/models/data-model';
import { createSimpleContext } from '@app-builder/utils/create-context';

const EditorDataModelsContext =
  createSimpleContext<DataModel[]>('EditorDataModels');

export function EditorDataModelsProvider({
  children,
  dataModels,
}: {
  children: React.ReactNode;
  dataModels: DataModel[];
}) {
  return (
    <EditorDataModelsContext.Provider value={dataModels}>
      {children}
    </EditorDataModelsContext.Provider>
  );
}

export const useEditorDataModels = EditorDataModelsContext.useValue;
