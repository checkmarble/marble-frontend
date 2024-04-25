import { type MarbleApi } from '@app-builder/infra/marble-api';
import {
  adaptCreateTableFieldDto,
  adaptDataModel,
  adaptUpdateFieldDto,
  type CreateFieldInput,
  type DataModel,
  type UpdateFieldInput,
} from '@app-builder/models';
import { type OpenApiSpec } from 'marble-api';

export interface DataModelRepository {
  getDataModel(): Promise<DataModel>;
  getOpenApiSpec(): Promise<OpenApiSpec>;
  postDataModelTableField(
    tableId: string,
    createFieldInput: CreateFieldInput,
  ): Promise<void>;
  patchDataModelField(
    tableId: string,
    updateFieldInput: UpdateFieldInput,
  ): Promise<void>;
}

export function getDataModelRepository() {
  return (marbleApiClient: MarbleApi): DataModelRepository => ({
    getDataModel: async () => {
      const { data_model } = await marbleApiClient.getDataModel();

      return adaptDataModel(data_model);
    },
    getOpenApiSpec: async () => {
      return marbleApiClient.getDataModelOpenApi();
    },
    postDataModelTableField: async (tableId, createFieldInput) => {
      await marbleApiClient.postDataModelTableField(
        tableId,
        adaptCreateTableFieldDto(createFieldInput),
      );
    },
    patchDataModelField: async (tableId, updateFieldInput) => {
      await marbleApiClient.patchDataModelField(
        tableId,
        adaptUpdateFieldDto(updateFieldInput),
      );
    },
  });
}
