import { type DataModel } from '@app-builder/models';
import { createSimpleContext } from '@app-builder/utils/create-context';

const DataModelContext = createSimpleContext<DataModel>('DataModelContext');

interface DataModelFeatureAccess {
  isCreateDataModelTableAvailable: boolean;
  isEditDataModelInfoAvailable: boolean;
  isCreateDataModelFieldAvailable: boolean;
  isEditDataModelFieldAvailable: boolean;
  isCreateDataModelLinkAvailable: boolean;
  isCreateDataModelPivotAvailable: boolean;
  isIngestDataAvailable: boolean;
}

const DataModelFeatureAccessContext = createSimpleContext<DataModelFeatureAccess>('DataModelFeatureAccessContext');

export function DataModelContextProvider({
  dataModel,
  dataModelFeatureAccess,
  children,
}: {
  dataModel: DataModel;
  dataModelFeatureAccess: DataModelFeatureAccess;
  children: React.ReactNode;
}) {
  return (
    <DataModelContext.Provider value={dataModel}>
      <DataModelFeatureAccessContext.Provider value={dataModelFeatureAccess}>
        {children}
      </DataModelFeatureAccessContext.Provider>
    </DataModelContext.Provider>
  );
}

export const useDataModel = DataModelContext.useValue;

export function getLinksToSingleMap(dataModel: DataModel) {
  return new Map(dataModel.flatMap((table) => table.linksToSingle).map((link) => [link.id, link]));
}
export const useDataModelFeatureAccess = DataModelFeatureAccessContext.useValue;
