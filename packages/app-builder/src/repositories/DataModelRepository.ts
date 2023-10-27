import { type MarbleApi } from '@app-builder/infra/marble-api';
import { adaptDataModelDto, type TableModel } from '@app-builder/models';
import { type OpenApiSpec } from 'marble-api';

export interface DataModelRepository {
  getDataModel(): Promise<TableModel[]>;
  getOpenApiSpec(): Promise<OpenApiSpec>;
}

export function getDataModelRepository() {
  return (marbleApiClient: MarbleApi): DataModelRepository => ({
    getDataModel: async () => {
      const { data_model } = await marbleApiClient.getDataModel();

      return adaptDataModelDto(data_model);
    },
    getOpenApiSpec: async () => {
      return marbleApiClient.getDataModelOpenApi();
    },
  });
}
