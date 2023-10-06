import { type MarbleApi } from '@app-builder/infra/marble-api';
import {
  adaptDataModelDto,
  type OpenAPISpec,
  type TableModel,
} from '@app-builder/models';

export interface DataModelRepository {
  getDataModel(): Promise<TableModel[]>;
  getOpenApiSpec(): Promise<OpenAPISpec>;
}

export function getDataModelRepository() {
  return (marbleApiClient: MarbleApi): DataModelRepository => ({
    getDataModel: async () => {
      const { data_model } = await marbleApiClient.getDataModelV2();

      return adaptDataModelDto(data_model);
    },
    getOpenApiSpec: async () => {
      return marbleApiClient.getDataModelOpenApi();
    },
  });
}
