import { type MarbleApi } from '@app-builder/infra/marble-api';
import {
  adaptCreatePivotInputDto,
  adaptCreateTableFieldDto,
  adaptDataModel,
  adaptPivot,
  adaptUpdateFieldDto,
  type CreateFieldInput,
  type CreatePivotInput,
  type DataModel,
  type Pivot,
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
  listPivots(args: { tableId?: string }): Promise<Pivot[]>;
  createPivot(pivot: CreatePivotInput): Promise<Pivot>;
}

export function makeGetDataModelRepository() {
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
    listPivots: async ({ tableId }) => {
      const { pivots } = await marbleApiClient.listDataModelPivots({ tableId });

      return pivots.map(adaptPivot);
    },
    createPivot: async (pivotInput) => {
      const { pivot } = await marbleApiClient.createDataModelPivot(
        adaptCreatePivotInputDto(pivotInput),
      );

      return adaptPivot(pivot);
    },
  });
}
