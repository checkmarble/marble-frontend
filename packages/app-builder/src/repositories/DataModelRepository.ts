import { type MarbleCoreApi } from '@app-builder/infra/marblecore-api';
import {
  adaptClientDataListRequestBodyDto,
  adaptClientDataListResponse,
  adaptCreatePivotInputDto,
  adaptCreateTableFieldDto,
  adaptDataModel,
  adaptDataModelObject,
  adaptPivot,
  adaptUpdateFieldDto,
  type ClientDataListRequestBody,
  type ClientDataListResponse,
  type CreateFieldInput,
  type CreatePivotInput,
  type DataModel,
  type DataModelObject,
  type Pivot,
  type UpdateFieldInput,
} from '@app-builder/models';
import { type OpenApiSpec } from 'marble-api';

export interface DataModelRepository {
  getDataModel(): Promise<DataModel>;
  getOpenApiSpec(): Promise<OpenApiSpec>;
  postDataModelTableField(tableId: string, createFieldInput: CreateFieldInput): Promise<void>;
  patchDataModelField(tableId: string, updateFieldInput: UpdateFieldInput): Promise<void>;
  listPivots(args: { tableId?: string }): Promise<Pivot[]>;
  createPivot(pivot: CreatePivotInput): Promise<Pivot>;
  getIngestedObject(tableName: string, objectId: string): Promise<DataModelObject>;
  listClientObjects(args: {
    tableName: string;
    body: ClientDataListRequestBody;
  }): Promise<ClientDataListResponse>;
}

export function makeGetDataModelRepository() {
  return (marbleCoreApiClient: MarbleCoreApi): DataModelRepository => ({
    getDataModel: async () => {
      const { data_model } = await marbleCoreApiClient.getDataModel();

      return adaptDataModel(data_model);
    },
    getOpenApiSpec: async () => {
      return marbleCoreApiClient.getDataModelOpenApi();
    },
    postDataModelTableField: async (tableId, createFieldInput) => {
      await marbleCoreApiClient.postDataModelTableField(
        tableId,
        adaptCreateTableFieldDto(createFieldInput),
      );
    },
    patchDataModelField: async (tableId, updateFieldInput) => {
      await marbleCoreApiClient.patchDataModelField(tableId, adaptUpdateFieldDto(updateFieldInput));
    },
    listPivots: async ({ tableId }) => {
      const { pivots } = await marbleCoreApiClient.listDataModelPivots({
        tableId,
      });

      return pivots.map(adaptPivot);
    },
    createPivot: async (pivotInput) => {
      const { pivot } = await marbleCoreApiClient.createDataModelPivot(
        adaptCreatePivotInputDto(pivotInput),
      );

      return adaptPivot(pivot);
    },
    getIngestedObject: async (tableName, objectId) => {
      return adaptDataModelObject(await marbleCoreApiClient.getIngestedObject(tableName, objectId));
    },
    listClientObjects: async (params) => {
      return adaptClientDataListResponse(
        await marbleCoreApiClient.listClientObjects(
          params.tableName,
          adaptClientDataListRequestBodyDto(params.body),
        ),
      );
    },
  });
}
