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
  adaptDestroyDataModelReport,
  adaptExportedFields,
  adaptExportedFieldsDto,
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
  type DestroyDataModelReport,
  type DestroyDataModelReportDto,
  ExportedFields,
  type Pivot,
  type SetDataModelTableOptionsBody,
  type UpdateFieldInput,
} from '@app-builder/models';
import { isStatusConflictHttpError } from '@app-builder/models/http-errors';
import { GroupedAnnotations, type OpenApiSpec } from 'marble-api';

export interface DataModelRepository {
  getDataModel(): Promise<DataModel>;
  getOpenApiSpec(): Promise<OpenApiSpec>;
  getOpenApiSpecOfVersion(version: string): Promise<OpenApiSpec>;
  postDataModelTableField(tableId: string, createFieldInput: CreateFieldInput): Promise<void>;
  patchDataModelField(tableId: string, updateFieldInput: UpdateFieldInput): Promise<void>;
  listPivots(args: { tableId?: string }): Promise<Pivot[]>;
  createPivot(pivot: CreatePivotInput): Promise<Pivot>;
  getIngestedObject(tableName: string, objectId: string): Promise<DataModelObject>;
  listClientObjects(args: { tableName: string; body: ClientDataListRequestBody }): Promise<ClientDataListResponse>;
  createNavigationOption(tableId: string, options: CreateNavigationOption): Promise<void>;
  getDataModelTableOptions(tableId: string): Promise<DataModelTableOptions>;
  setDataModelTableOptions(tableId: string, body: SetDataModelTableOptionsBody): Promise<void>;
  createAnnotation(tableName: string, objectId: string, body: CreateAnnotationBody): Promise<void>;
  deleteAnnotation(annotationId: string): Promise<void>;
  updateDataModelTableExportedFields(tableId: string, body: ExportedFields): Promise<ExportedFields>;
  getDataModelTableExportedFields(tableId: string): Promise<ExportedFields>;
  deleteTable(tableId: string, options: { perform: boolean }): Promise<DestroyDataModelReport>;
  deleteField(fieldId: string, options: { perform: boolean }): Promise<DestroyDataModelReport>;
  deleteLink(linkId: string, options: { perform: boolean }): Promise<DestroyDataModelReport>;
  deletePivot(pivotId: string, options: { perform: boolean }): Promise<DestroyDataModelReport>;
  getAnnotationsByTableNameAndObjectId(tableName: string, objectId: string): Promise<GroupedAnnotations>;
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
    getOpenApiSpecOfVersion: async (version: string) => {
      return marbleCoreApiClient.getDataModelOpenApiOfVersion(version);
    },
    postDataModelTableField: async (tableId, createFieldInput) => {
      await marbleCoreApiClient.postDataModelTableField(tableId, adaptCreateTableFieldDto(createFieldInput));
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
      const { pivot } = await marbleCoreApiClient.createDataModelPivot(adaptCreatePivotInputDto(pivotInput));

      return adaptPivot(pivot);
    },
    getIngestedObject: async (tableName, objectId) => {
      return adaptDataModelObject(await marbleCoreApiClient.getIngestedObject(tableName, objectId));
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
    deleteField: async (fieldId, options) => {
      try {
        const result = await marbleCoreApiClient.deleteDataModelField(fieldId, options);
        return adaptDestroyDataModelReport(result as DestroyDataModelReportDto);
      } catch (error) {
        // 409 Conflict is a valid response containing the DestroyDataModelReport with blocking conflicts
        if (isStatusConflictHttpError(error)) {
          return adaptDestroyDataModelReport(error.data as DestroyDataModelReportDto);
        }
        throw error;
      }
    },
    deleteLink: async (linkId, options) => {
      try {
        const result = await marbleCoreApiClient.deleteDataModelLink(linkId, options);
        return adaptDestroyDataModelReport(result as DestroyDataModelReportDto);
      } catch (error) {
        // 409 Conflict is a valid response containing the DestroyDataModelReport with blocking conflicts
        if (isStatusConflictHttpError(error)) {
          return adaptDestroyDataModelReport(error.data as DestroyDataModelReportDto);
        }
        throw error;
      }
    },
    deletePivot: async (pivotId, options) => {
      try {
        const result = await marbleCoreApiClient.deleteDataModelPivot(pivotId, options);
        return adaptDestroyDataModelReport(result as DestroyDataModelReportDto);
      } catch (error) {
        // 409 Conflict is a valid response containing the DestroyDataModelReport with blocking conflicts
        if (isStatusConflictHttpError(error)) {
          return adaptDestroyDataModelReport(error.data as DestroyDataModelReportDto);
        }
        throw error;
      }
    },
    getAnnotationsByTableNameAndObjectId: async (tableName, objectId) => {
      return marbleCoreApiClient.getAnnotationsByTableNameAndObjectId(tableName, objectId);
    },
  });
}
