import { type MarbleApi } from '@app-builder/infra/marble-api';
import { adaptDataModelDto, type TableModel } from '@app-builder/models';

export interface DataModelRepository {
  getDataModel(): Promise<TableModel[]>;
}

export function getDataModelRepository() {
  return (marbleApiClient: MarbleApi): DataModelRepository => ({
    getDataModel: async () => {
      const { data_model } = await marbleApiClient.getDataModel();

      return adaptDataModelDto(data_model);
    },
  });
}
