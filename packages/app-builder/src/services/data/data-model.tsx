import { type TableModel } from '@app-builder/models';
import { createSimpleContext } from '@app-builder/utils/create-context';

const DataModelContext = createSimpleContext<TableModel[]>('DataModelContext');

export const DataModelContextProvider = DataModelContext.Provider;

export const useDataModel = DataModelContext.useValue;
