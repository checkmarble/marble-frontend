import { MAX_FILE_SIZE } from '@app-builder/hooks/useFormDropzone';
import { type MarbleCoreApi } from '@app-builder/infra/marblecore-api';
import { authMiddleware } from '@app-builder/middlewares/auth-middleware';
import {
  isNotFoundHttpError,
  isRequestTimeoutHttpError,
  isStatusConflictHttpError,
  REQUEST_TIMEOUT_ERROR_MESSAGE,
} from '@app-builder/models';
import { adaptCase, type Case } from '@app-builder/models/cases';
import { type ClientDataListResponse, type DataModel, type DataModelObjectValue } from '@app-builder/models/data-model';
import { createAnnotationPayloadSchema } from '@app-builder/schemas/annotations';
import {
  applyArchetypePayloadSchema,
  createNavigationOptionSchema,
  createTableValueSchema,
  deleteTablePayloadSchema,
  editSemanticTablePayloadSchema,
  listObjectsInputSchema,
} from '@app-builder/schemas/data';
import {
  applyArchetype,
  createAnnotation,
  createNavigationOption,
  createTable,
  deleteAnnotation,
  deleteTable,
  getAnnotationsByTableNameAndObjectId,
  getDataModel,
  getIngestedObject,
  listClientObjects,
  patchDataModelTable,
} from '@app-builder/server/data-model';
import { useAuthSession } from '@app-builder/services/auth/auth-session.server';
import { getTableMutationError } from '@app-builder/services/data/table-mutation-errors';
import { getFixedT } from '@app-builder/services/i18n/i18next.server';
import { getServerEnv } from '@app-builder/utils/environment';
import { getClientAnnotationFileUploadEndpoint, getIngestionDataBatchUploadEndpoint } from '@app-builder/utils/files';
import { omitUndefined } from '@app-builder/utils/omit-undefined';
import { tryCatch } from '@app-builder/utils/tryCatch';
import * as Sentry from '@sentry/tanstackstart-react';
import { createServerFn } from '@tanstack/react-start';
import { getRequest } from '@tanstack/react-start/server';
import { decode } from 'decode-formdata';
import { UpdateTableBodyDto } from 'marble-api';
import { match } from 'ts-pattern';
import { z } from 'zod/v4';

// ---- HierarchyTree types (exported for use in queries) ----

export type HierarchyLeaf = {
  objectType: string;
  /** Stable id of the navigation option that produced this leaf. Several options can
   * target the same table, so objectType alone does not identify the option. */
  navigationOptionId?: string;
  data: Record<string, DataModelObjectValue>[];
};

export type HierarchyNode = {
  objectType: string;
  objectId: string;
  data: Record<string, DataModelObjectValue>;
  children: HierarchyLeaf[];
};

export type HierarchyTreeBase = HierarchyNode & {
  parents: HierarchyNode[];
};

// ---- Data model reads ----

export const getDataModelFn = createServerFn({ method: 'GET' })
  .middleware([authMiddleware])
  .handler(async ({ context }) => {
    const dataModel = await getDataModel(context.api);
    return { dataModel } as { dataModel: DataModel };
  });

export const getObjectDetailsFn = createServerFn({ method: 'GET' })
  .middleware([authMiddleware])
  .validator(z.object({ objectType: z.string(), objectId: z.string() }))
  .handler(async ({ context, data }) => {
    return getIngestedObject(context.api, data.objectType, data.objectId);
  });

export const getObjectCasesFn = createServerFn({ method: 'GET' })
  .middleware([authMiddleware])
  .validator(z.object({ objectType: z.string(), objectId: z.string() }))
  .handler(async ({ context, data }) => {
    const cases = (await context.api.getCasesForObject(data.objectType, data.objectId)).map(adaptCase);
    return { cases } as { cases: Case[] };
  });

export const getAnnotationsFn = createServerFn({ method: 'GET' })
  .middleware([authMiddleware])
  .validator(z.object({ objectType: z.string(), objectId: z.string(), loadThumbnails: z.boolean().optional() }))
  .handler(async ({ context, data }) => {
    const annotations = await getAnnotationsByTableNameAndObjectId(
      context.api,
      data.objectType,
      data.objectId,
      data.loadThumbnails ?? false,
    );
    return { annotations };
  });

export const getHierarchyFn = createServerFn({ method: 'GET' })
  .middleware([authMiddleware])
  .validator(z.object({ objectType: z.string(), objectId: z.string(), showAll: z.boolean().optional() }))
  .handler(async ({ context, data }) => {
    const { api } = context;
    const { objectType, objectId } = data;

    const dataModel = await getDataModel(api);
    const baseObject = await getIngestedObject(api, objectType, objectId);
    const baseObjectTable = dataModel.find((table) => table.name === objectType);

    if (!baseObjectTable) {
      throw new Error(`Object type '${objectType}' not found`);
    }

    const baseObjectHierarchyNode: HierarchyTreeBase = {
      objectType,
      objectId,
      data: baseObject.data,
      children: [],
      parents: [],
    };

    const baseObjectParentsTables = dataModel
      .flatMap((table) => table.linksToSingle)
      .filter((link) => link.childTableName === objectType);

    await retrieveChildren(objectType, baseObject, baseObjectTable.navigationOptions, api, baseObjectHierarchyNode);

    for (const link of baseObjectParentsTables) {
      if (link.parentFieldName !== 'object_id') continue;
      const fieldValue = baseObject.data[link.childFieldName];
      if (typeof fieldValue !== 'string' && typeof fieldValue !== 'number') continue;

      const parentTableName = link.parentTableName;
      const parentObjectTable = dataModel.find((table) => table.name === parentTableName);
      if (!parentObjectTable) continue;

      try {
        const parentObject = await getIngestedObject(
          api,
          parentTableName,
          baseObject.data[link.childFieldName] as string,
        );

        const parentObjectHierarchyNode = {
          objectType: link.parentTableName,
          objectId: parentObject.data['object_id'] as string,
          data: parentObject.data,
          children: [],
        };

        if (data.showAll) {
          await retrieveChildren(
            link.parentTableName,
            parentObject,
            parentObjectTable.navigationOptions,
            api,
            parentObjectHierarchyNode,
          );
        }

        baseObjectHierarchyNode.parents.push(parentObjectHierarchyNode);
      } catch (error) {
        if (!isNotFoundHttpError(error)) {
          Sentry.captureException(error);
        }
      }
    }

    return { hierarchy: baseObjectHierarchyNode };
  });

export const listObjectsFn = createServerFn({ method: 'POST' })
  .middleware([authMiddleware])
  .validator(listObjectsInputSchema)
  .handler(async ({ context, data }) => {
    const { tableName, limit, offsetId, ...explorationOptions } = data;
    try {
      const clientDataListResponse = await listClientObjects(context.api, {
        tableName,
        body: {
          explorationOptions,
          ...(limit !== undefined ? { limit } : {}),
          ...(offsetId !== undefined ? { offsetId } : {}),
        },
      });
      return { clientDataListResponse } as { clientDataListResponse: ClientDataListResponse };
    } catch (error) {
      // A timeout is not a failure of the data: the UI tells it apart from other errors.
      if (isRequestTimeoutHttpError(error)) throw new Error(REQUEST_TIMEOUT_ERROR_MESSAGE);
      throw error;
    }
  });

export const listArchetypesFn = createServerFn({ method: 'GET' })
  .middleware([authMiddleware])
  .handler(async ({ context }) => {
    const { archetypes } = await context.api.listArchetypes();
    return archetypes;
  });

export const createTableFn = createServerFn({ method: 'POST' })
  .middleware([authMiddleware])
  .validator(createTableValueSchema)
  .handler(async ({ context, data }) => {
    const request = getRequest();
    const t = await getFixedT(request, ['common', 'data']);

    try {
      return await createTable(context.api, data);
    } catch (error) {
      const mutError = getTableMutationError(error, t, {
        conflictMessage: isStatusConflictHttpError(error) ? t('common:errors.data.duplicate_table_name') : undefined,
      });

      throw mutError;
    }
  });

export const deleteTableFn = createServerFn({ method: 'POST' })
  .middleware([authMiddleware])
  .validator(deleteTablePayloadSchema)
  .handler(async ({ context, data }) => {
    const request = getRequest();
    const t = await getFixedT(request, ['common']);

    try {
      return deleteTable(context.api, data.tableId, { perform: data.perform });
    } catch (error) {
      const mutError = getTableMutationError(error, t);
      throw mutError;
    }
  });

export const createNavigationOptionFn = createServerFn({ method: 'POST' })
  .middleware([authMiddleware])
  .validator(z.object({ tableId: z.string(), ...createNavigationOptionSchema.shape }))
  .handler(async ({ context, data }) => {
    const { tableId, ...options } = data;
    try {
      await createNavigationOption(context.api, tableId, options);
      return { success: true };
    } catch (err) {
      if (isStatusConflictHttpError(err)) {
        return { status: 'error', error: 'duplicate_pivot_value' as const };
      }
      throw new Error('Failed to create navigation option');
    }
  });

export const applyArchetypeFn = createServerFn({ method: 'POST' })
  .middleware([authMiddleware])
  .validator(applyArchetypePayloadSchema)
  .handler(async ({ context, data }) => {
    try {
      await applyArchetype(context.api, data.name);
      return { success: true };
    } catch {
      return { success: false };
    }
  });

export const editSemanticTableFn = createServerFn({ method: 'POST' })
  .middleware([authMiddleware])
  .validator(editSemanticTablePayloadSchema)
  .handler(async ({ context, data }) => {
    const request = getRequest();
    const t = await getFixedT(request, ['common', 'data']);

    try {
      const patchBody = omitUndefined({
        description: data.description,
        semantic_type: data.semantic_type,
        caption_field: data.caption_field,
        alias: data.alias,
        ftm_entity: data.ftm_entity as UpdateTableBodyDto['ftm_entity'] | undefined,
        primary_ordering_field: data.primary_ordering_field,
        fields: data.fields,
        links: data.links,
        metadata: data.metadata,
      } satisfies UpdateTableBodyDto);

      await patchDataModelTable(context.api, data.tableId, patchBody);
    } catch (error) {
      const mutError = getTableMutationError(error, t);
      throw mutError;
    }
  });

// ---- Annotations ----

export const createAnnotationFn = createServerFn({ method: 'POST' })
  .middleware([authMiddleware])
  .validator((data: unknown) => {
    if (!(data instanceof FormData)) throw new Error('Expected FormData');
    return data;
  })
  .handler(async ({ context, data: formData }) => {
    const request = getRequest();
    const authSession = await useAuthSession();

    const rawResult = tryCatch(() => {
      const contentLength = request.headers.get('content-length');
      if (contentLength && parseInt(contentLength, 10) > MAX_FILE_SIZE) {
        throw new Error('File too large');
      }
      return formData;
    });

    if (!rawResult.ok) {
      return { success: false, error: 'file_too_large' as const };
    }

    const token = authSession.data.authToken?.access_token;
    if (!token) throw new Error('Not authenticated');

    const {
      data: parsedData,
      success,
      error,
    } = createAnnotationPayloadSchema.safeParse(
      decode(rawResult.value, {
        arrays: ['payload.files', 'payload.addedTags', 'payload.removedAnnotations', 'payload.addedCategories'],
      }),
    );

    if (!success) {
      return { success: false, errors: z.treeifyError(error) };
    }

    try {
      return await match(parsedData)
        .with({ type: 'comment' }, async ({ payload: { text }, ...d }) => {
          await createAnnotation(context.api, d.tableName, d.objectId, {
            type: 'comment',
            caseId: d.caseId,
            payload: { text },
          });
          return { success: true };
        })
        .with({ type: 'tag' }, async ({ payload: { addedTags = [], removedAnnotations = [] }, ...d }) => {
          await Promise.all([
            ...addedTags.map((tagAdded) =>
              createAnnotation(context.api, d.tableName, d.objectId, {
                type: 'tag',
                caseId: d.caseId,
                payload: { tagId: tagAdded },
              }),
            ),
            ...removedAnnotations.map((annotationId) => deleteAnnotation(context.api, annotationId)),
          ]);
          return { success: true };
        })
        .with({ type: 'risk_tag' }, async ({ payload: { addedCategories = [], removedAnnotations = [] }, ...d }) => {
          await Promise.all([
            ...addedCategories.map((categoryAdded) =>
              createAnnotation(context.api, d.tableName, d.objectId, {
                type: 'risk_tag',
                caseId: d.caseId,
                payload: { tag: categoryAdded },
              }),
            ),
            ...removedAnnotations.map((annotationId) => deleteAnnotation(context.api, annotationId)),
          ]);
          return { success: true };
        })
        .with({ type: 'file' }, async ({ payload: { files }, ...d }) => {
          if (files.length > 0) {
            const body = new FormData();
            body.append('caption', 'File annotation');
            if (d.caseId) body.append('case_id', d.caseId);
            files.forEach((file) => body.append('files[]', file));

            const endpoint = getClientAnnotationFileUploadEndpoint(d.tableName, d.objectId);
            const response = await fetch(`${getServerEnv('MARBLE_API_URL')}${endpoint}`, {
              method: 'POST',
              body,
              headers: { Authorization: `Bearer ${token}` },
            });
            if (response.status !== 200) throw response;
          }
          return { success: true };
        })
        .exhaustive();
    } catch {
      throw new Error('Failed to create annotation');
    }
  });

export const deleteAnnotationFn = createServerFn({ method: 'POST' })
  .middleware([authMiddleware])
  .validator(z.object({ annotationId: z.string() }))
  .handler(async ({ context, data }) => {
    try {
      await deleteAnnotation(context.api, data.annotationId);
      return { success: true };
    } catch {
      return { success: false, errors: [] };
    }
  });

// ---- Ingestion upload ----

const INGESTION_UPLOAD_QUERY_PARAMS = new Set(['monitor', 'skip_screening', 'monitoring_config_id']);

export const uploadIngestionDataFn = createServerFn({ method: 'POST' })
  .middleware([authMiddleware])
  .validator((data: unknown) => {
    if (!(data instanceof FormData)) throw new Error('Expected FormData');
    return data;
  })
  .handler(async ({ context, data }) => {
    const objectType = data.get('objectType') as string | null;
    if (!objectType) return new Response(null, { status: 400 });

    const token = await context.tokenService.getToken();

    const backendData = new FormData();
    const searchParams = new URLSearchParams();
    for (const [key, value] of data.entries()) {
      if (key === 'objectType') continue;
      if (INGESTION_UPLOAD_QUERY_PARAMS.has(key) && typeof value === 'string') {
        searchParams.append(key, value);
        continue;
      }
      backendData.append(key, value);
    }

    const query = searchParams.toString();
    const upstream = await fetch(
      `${getServerEnv('MARBLE_API_URL')}${getIngestionDataBatchUploadEndpoint(objectType)}${query ? `?${query}` : ''}`,
      {
        body: backendData,
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
      },
    );

    const headers = new Headers(upstream.headers);
    headers.delete('content-encoding');
    headers.delete('content-length');
    const body = [204, 205, 304].includes(upstream.status) ? null : await upstream.arrayBuffer();
    return new Response(body, {
      status: upstream.status,
      statusText: upstream.statusText,
      headers,
    });
  });

export const getUploadLogsFn = createServerFn({ method: 'GET' })
  .middleware([authMiddleware])
  .validator(z.object({ objectType: z.string() }))
  .handler(async ({ context, data: { objectType } }) => {
    return context.api.getIngestionUploadLogs(objectType);
  });

// ---- Org import ----

export const importOrgFn = createServerFn({ method: 'POST' })
  .middleware([authMiddleware])
  .validator(z.object({ body: z.unknown() }))
  .handler(async ({ context, data }) => {
    try {
      await context.api.importOrganization(data.body);
      return { success: true, message: 'Import successful' };
    } catch (error: any) {
      console.error('[import-org] Import failed:', error);
      return { success: false, message: (error?.data?.message ?? error?.message ?? 'Import failed') as string };
    }
  });

export const importOrgFileFn = createServerFn({ method: 'POST' })
  .middleware([authMiddleware])
  .validator((data: unknown) => {
    if (!(data instanceof FormData)) throw new Error('Expected FormData');
    return data;
  })
  .handler(async ({ context, data }) => {
    const file = data.get('file');
    if (!(file instanceof Blob)) {
      return { success: false, message: 'Cannot read file' };
    }

    try {
      await context.api.importOrganizationFromFile({ file });
      return { success: true, message: 'Import successful' };
    } catch (error: any) {
      console.error('[import-org-file] Import failed:', error);
      return { success: false, message: (error?.data?.message ?? error?.message ?? 'Import failed') as string };
    }
  });

// ---- Hierarchy helper ----

async function retrieveChildren(
  objectType: string,
  object: { data: Record<string, DataModelObjectValue> },
  navigationOptions:
    | {
        id: string;
        filterFieldName: string;
        sourceFieldName: string;
        orderingFieldName: string;
        targetTableName: string;
      }[]
    | undefined,
  api: MarbleCoreApi,
  hierarchyNode: HierarchyNode,
) {
  if (!navigationOptions) return;

  for (const navigationOption of navigationOptions) {
    const requestBody = {
      explorationOptions: {
        sourceTableName: objectType,
        filterFieldName: navigationOption.filterFieldName,
        filterFieldValue: object.data[navigationOption.sourceFieldName] as string | number,
        orderingFieldName: navigationOption.orderingFieldName,
      },
      limit: 5,
    };

    const data = await listClientObjects(api, {
      tableName: navigationOption.targetTableName,
      body: requestBody,
    });

    if (data.data.length === 0) continue;

    hierarchyNode.children.push({
      objectType: navigationOption.targetTableName,
      navigationOptionId: navigationOption.id,
      data: data.data.map((item) => item.data),
    });
  }
}
