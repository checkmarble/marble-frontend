import { type MarbleCoreApi } from '@app-builder/infra/marblecore-api';
import {
  adaptClientDataListRequestBodyDto,
  adaptClientDataListResponse,
  adaptCreateAnnotationDto,
  adaptCreateNavigationOptionDto,
  adaptDataModel,
  adaptDataModelObject,
  adaptDestroyDataModelReport,
  adaptExportedFields,
  adaptExportedFieldsDto,
  adaptPivot,
  type ClientDataListRequestBody,
  type ClientDataListResponse,
  type CreateAnnotationBody,
  type CreateNavigationOption,
  createTableValueToCreateTableBody,
  type DataModel,
  type DataModelObject,
  type DestroyDataModelReport,
  type DestroyDataModelReportDto,
  type ExportedFields,
  type Pivot,
} from '@app-builder/models';
import { isStatusConflictHttpError } from '@app-builder/models/http-errors';
import { type CreateTableValue } from '@app-builder/schemas/data';
import { type GroupedAnnotations, type UpdateTableBodyDto } from 'marble-api';

export async function getDataModel(api: MarbleCoreApi): Promise<DataModel> {
  const { data_model } = await api.getDataModel();
  return adaptDataModel(data_model);
}

export async function applyArchetype(api: MarbleCoreApi, name: string): Promise<void> {
  await api.applyArchetype({ name }, {});
}

export async function createTable(api: MarbleCoreApi, body: CreateTableValue): Promise<{ id: string }> {
  return api.postDataModelTable(createTableValueToCreateTableBody(body));
}

export async function patchDataModelTable(
  api: MarbleCoreApi,
  tableId: string,
  body: UpdateTableBodyDto,
): Promise<void> {
  await api.patchDataModelTable(tableId, body);
}

export async function listPivots(api: MarbleCoreApi, { tableId }: { tableId?: string }): Promise<Pivot[]> {
  const { pivots } = await api.listDataModelPivots({ tableId });
  return pivots.map(adaptPivot);
}

export async function getIngestedObject(
  api: MarbleCoreApi,
  tableName: string,
  objectId: string,
): Promise<DataModelObject> {
  return adaptDataModelObject(await api.getIngestedObject(tableName, objectId));
}

export async function listClientObjects(
  api: MarbleCoreApi,
  params: { tableName: string; body: ClientDataListRequestBody },
): Promise<ClientDataListResponse> {
  return adaptClientDataListResponse(
    await api.listClientObjects(params.tableName, adaptClientDataListRequestBodyDto(params.body)),
  );
}

export async function createNavigationOption(
  api: MarbleCoreApi,
  tableId: string,
  options: CreateNavigationOption,
): Promise<void> {
  await api.postDataModelTableNavigationOption(tableId, adaptCreateNavigationOptionDto(options));
}

export async function createAnnotation(
  api: MarbleCoreApi,
  tableName: string,
  objectId: string,
  body: CreateAnnotationBody,
): Promise<void> {
  await api.createAnnotation(tableName, objectId, adaptCreateAnnotationDto(body));
}

export async function deleteAnnotation(api: MarbleCoreApi, annotationId: string): Promise<void> {
  await api.deleteAnnotation(annotationId);
}

export async function updateDataModelTableExportedFields(
  api: MarbleCoreApi,
  tableId: string,
  body: ExportedFields,
): Promise<ExportedFields> {
  return adaptExportedFields(await api.updateDataModelTableExportedFields(tableId, adaptExportedFieldsDto(body)));
}

export async function getDataModelTableExportedFields(api: MarbleCoreApi, tableId: string): Promise<ExportedFields> {
  return adaptExportedFields(await api.getDataModelTableExportedFields(tableId));
}

export async function deleteTable(
  api: MarbleCoreApi,
  tableId: string,
  options: { perform: boolean },
): Promise<DestroyDataModelReport> {
  try {
    const result = await api.deleteDataModelTable(tableId, options);
    return adaptDestroyDataModelReport(result as DestroyDataModelReportDto);
  } catch (error) {
    // 409 Conflict is a valid response containing the DestroyDataModelReport with blocking conflicts
    if (isStatusConflictHttpError(error)) {
      return adaptDestroyDataModelReport(error.data as DestroyDataModelReportDto);
    }
    throw error;
  }
}

export async function getAnnotationsByTableNameAndObjectId(
  api: MarbleCoreApi,
  tableName: string,
  objectId: string,
  loadThumbnails: boolean,
): Promise<GroupedAnnotations> {
  return api.getAnnotationsByTableNameAndObjectId(tableName, objectId, { loadThumbnails });
}
