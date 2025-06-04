import { type MarbleCoreApi } from '@app-builder/infra/marblecore-api';
import {
  adaptClientDataListRequestBodyDto,
  adaptClientDataListResponse,
  adaptCreateAnnotationDto,
  adaptCreateNavigationOptionDto,
  adaptCreatePivotInputDto,
  adaptCreateTableFieldDto,
  adaptDataModel,
  adaptDataModelObject,
  adaptDataModelTableOptions,
  adaptPivot,
  adaptSetDataModelTableOptionBodyDto,
  adaptUpdateFieldDto,
  type ClientDataListRequestBody,
  type ClientDataListResponse,
  type CreateAnnotationBody,
  type CreateFieldInput,
  type CreateNavigationOption,
  type CreatePivotInput,
  type DataModel,
  type DataModelObject,
  type DataModelTableOptions,
  type Pivot,
  type SetDataModelTableOptionsBody,
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
  createNavigationOption(tableId: string, options: CreateNavigationOption): Promise<void>;
  getDataModelTableOptions(tableId: string): Promise<DataModelTableOptions>;
  setDataModelTableOptions(tableId: string, body: SetDataModelTableOptionsBody): Promise<void>;
  createAnnotation(tableName: string, objectId: string, body: CreateAnnotationBody): Promise<void>;
  deleteAnnotation(annotationId: string): Promise<void>;
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
    createNavigationOption: async (tableId, options) => {
      await marbleCoreApiClient.postDataModelTableNavigationOption(
        tableId,
        adaptCreateNavigationOptionDto(options),
      );
    },
    getDataModelTableOptions: async (tableId) => {
      return adaptDataModelTableOptions(
        await marbleCoreApiClient.getDataModelTableOptions(tableId),
      );
    },
    setDataModelTableOptions: async (tableId, body) => {
      await marbleCoreApiClient.setDataModelTableOptions(
        tableId,
        adaptSetDataModelTableOptionBodyDto(body),
      );
    },
    createAnnotation: async (tableName, objectId, body) => {
      await marbleCoreApiClient.createAnnotation(
        tableName,
        objectId,
        adaptCreateAnnotationDto(body),
      );
    },
    deleteAnnotation: async (annotationId) => {
      await marbleCoreApiClient.deleteAnnotation(annotationId);
    },
  });
}
