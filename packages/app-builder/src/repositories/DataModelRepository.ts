import { type MarbleCoreApi } from '@app-builder/infra/marblecore-api';
import {
  adaptClientDataListRequestBodyDto,
  adaptClientDataListResponse,
  adaptCreateAnnotationDto,
  adaptCreateNavigationOptionDto,
  adaptDataModel,
  adaptDataModelObject,
  adaptDataModelTableOptions,
  adaptDestroyDataModelReport,
  adaptExportedFields,
  adaptExportedFieldsDto,
  adaptPivot,
  adaptSetDataModelTableOptionBodyDto,
  type ClientDataListRequestBody,
  type ClientDataListResponse,
  type CreateAnnotationBody,
  type CreateNavigationOption,
  createTableValueToCreateTableBody,
  type DataModel,
  type DataModelObject,
  type DataModelTableOptions,
  type DestroyDataModelReport,
  type DestroyDataModelReportDto,
  ExportedFields,
  type Pivot,
  type SetDataModelTableOptionsBody,
} from '@app-builder/models';
import { adaptCase, Case } from '@app-builder/models/cases';
import { isStatusConflictHttpError } from '@app-builder/models/http-errors';
import { CreateTableValue } from '@app-builder/schemas/data';
import { GroupedAnnotations, type OpenApiSpec, UpdateTableBodyDto } from 'marble-api';

export interface DataModelRepository {
  getDataModel(): Promise<DataModel>;
  getOpenApiSpecOfVersion(version: string): Promise<OpenApiSpec>;
  createTable(body: CreateTableValue): Promise<{ id: string }>;
  patchDataModelTable(tableId: string, body: UpdateTableBodyDto): Promise<void>;
  listPivots(args: { tableId?: string }): Promise<Pivot[]>;
  getIngestedObject(tableName: string, objectId: string): Promise<DataModelObject>;
  getCasesForObject(objectType: string, objectId: string): Promise<Case[]>;
  listClientObjects(args: { tableName: string; body: ClientDataListRequestBody }): Promise<ClientDataListResponse>;
  createNavigationOption(tableId: string, options: CreateNavigationOption): Promise<void>;
  getDataModelTableOptions(tableId: string): Promise<DataModelTableOptions>;
  setDataModelTableOptions(tableId: string, body: SetDataModelTableOptionsBody): Promise<void>;
  createAnnotation(tableName: string, objectId: string, body: CreateAnnotationBody): Promise<void>;
  deleteAnnotation(annotationId: string): Promise<void>;
  updateDataModelTableExportedFields(tableId: string, body: ExportedFields): Promise<ExportedFields>;
  getDataModelTableExportedFields(tableId: string): Promise<ExportedFields>;
  deleteTable(tableId: string, options: { perform: boolean }): Promise<DestroyDataModelReport>;
  getAnnotationsByTableNameAndObjectId(
    tableName: string,
    objectId: string,
    loadThumbnails: boolean,
  ): Promise<GroupedAnnotations>;
}

export function makeGetDataModelRepository() {
  return (marbleCoreApiClient: MarbleCoreApi): DataModelRepository => ({
    createTable: async (body) => {
      return marbleCoreApiClient.postDataModelTable(createTableValueToCreateTableBody(body));
    },
    getDataModel: async () => {
      const { data_model } = await marbleCoreApiClient.getDataModel();

      return adaptDataModel(data_model);
    },
    getOpenApiSpecOfVersion: async (version: string) => {
      return marbleCoreApiClient.getDataModelOpenApiOfVersion(version);
    },
    patchDataModelTable: async (tableId, body) => {
      await marbleCoreApiClient.patchDataModelTable(tableId, body);
    },
    listPivots: async ({ tableId }) => {
      const { pivots } = await marbleCoreApiClient.listDataModelPivots({
        tableId,
      });

      return pivots.map(adaptPivot);
    },
    getIngestedObject: async (tableName, objectId) => {
      return adaptDataModelObject(await marbleCoreApiClient.getIngestedObject(tableName, objectId));
    },
    getCasesForObject: async (objectType, objectId) => {
      return (await marbleCoreApiClient.getCasesForObject(objectType, objectId)).map(adaptCase);
    },
    listClientObjects: async (params) => {
      return adaptClientDataListResponse(
        await marbleCoreApiClient.listClientObjects(params.tableName, adaptClientDataListRequestBodyDto(params.body)),
      );
    },
    createNavigationOption: async (tableId, options) => {
      await marbleCoreApiClient.postDataModelTableNavigationOption(tableId, adaptCreateNavigationOptionDto(options));
    },
    getDataModelTableOptions: async (tableId) => {
      return adaptDataModelTableOptions(await marbleCoreApiClient.getDataModelTableOptions(tableId));
    },
    setDataModelTableOptions: async (tableId, body) => {
      await marbleCoreApiClient.setDataModelTableOptions(tableId, adaptSetDataModelTableOptionBodyDto(body));
    },
    createAnnotation: async (tableName, objectId, body) => {
      await marbleCoreApiClient.createAnnotation(tableName, objectId, adaptCreateAnnotationDto(body));
    },
    deleteAnnotation: async (annotationId) => {
      await marbleCoreApiClient.deleteAnnotation(annotationId);
    },
    updateDataModelTableExportedFields: async (tableId, body): Promise<ExportedFields> => {
      return adaptExportedFields(
        await marbleCoreApiClient.updateDataModelTableExportedFields(tableId, adaptExportedFieldsDto(body)),
      );
    },
    getDataModelTableExportedFields: async (tableId) => {
      return adaptExportedFields(await marbleCoreApiClient.getDataModelTableExportedFields(tableId));
    },
    deleteTable: async (tableId, options) => {
      try {
        const result = await marbleCoreApiClient.deleteDataModelTable(tableId, options);
        return adaptDestroyDataModelReport(result as DestroyDataModelReportDto);
      } catch (error) {
        // 409 Conflict is a valid response containing the DestroyDataModelReport with blocking conflicts
        if (isStatusConflictHttpError(error)) {
          return adaptDestroyDataModelReport(error.data as DestroyDataModelReportDto);
        }
        throw error;
      }
    },
    getAnnotationsByTableNameAndObjectId: async (tableName, objectId, loadThumbnails = false) => {
      return marbleCoreApiClient.getAnnotationsByTableNameAndObjectId(tableName, objectId, { loadThumbnails });
    },
  });
}
