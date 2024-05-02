import { type DataModel } from '@app-builder/models';
import { createSimpleContext } from '@app-builder/utils/create-context';

const DataModelContext = createSimpleContext<DataModel>('DataModelContext');

export const DataModelContextProvider = DataModelContext.Provider;

export const useDataModel = DataModelContext.useValue;

export function getLinksToSingleMap(dataModel: DataModel) {
  return new Map(
    dataModel
      .flatMap((table) => table.linksToSingle)
      .map((link) => [link.id, link]),
  );
}
