import { MAX_FILE_SIZE } from '@app-builder/hooks/useFormDropzone';
import { authMiddleware } from '@app-builder/middlewares/auth-middleware';
import { isNotFoundHttpError, isStatusConflictHttpError } from '@app-builder/models';
import { type Case } from '@app-builder/models/cases';
import {
  type ClientDataListResponse,
  type DataModel,
  type DataModelObjectValue,
  type DataModelWithTableOptions,
  mergeDataModelWithTableOptions,
  type TableModelWithOptions,
} from '@app-builder/models/data-model';
import { createAnnotationPayloadSchema } from '@app-builder/schemas/annotations';
import {
  applyArchetypePayloadSchema,
  createNavigationOptionSchema,
  createTableValueSchema,
  deleteTablePayloadSchema,
  editSemanticTablePayloadSchema,
  listObjectsInputSchema,
} from '@app-builder/schemas/data';
import { useAuthSession } from '@app-builder/services/auth/auth-session.server';
import { getTableMutationError } from '@app-builder/services/data/table-mutation-errors';
import { getServerEnv } from '@app-builder/utils/environment';
import { getClientAnnotationFileUploadEndpoint, getIngestionDataBatchUploadEndpoint } from '@app-builder/utils/files';
import { omitUndefined } from '@app-builder/utils/omit-undefined';
import * as Sentry from '@sentry/tanstackstart-react';
import { createServerFn } from '@tanstack/react-start';
import { getRequest } from '@tanstack/react-start/server';
import { decode } from 'decode-formdata';
import { UpdateTableBodyDto } from 'marble-api';
import { tryit } from 'radash';
import { match } from 'ts-pattern';
import { z } from 'zod/v4';

// ---- HierarchyTree types (exported for use in queries) ----

export type HierarchyLeaf = {
  objectType: string;
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
    const dataModel = await context.authInfo.dataModelRepository.getDataModel();
    return { dataModel } as { dataModel: DataModel };
  });

export const getDataModelWithOptionsFn = createServerFn({ method: 'GET' })
  .middleware([authMiddleware])
  .handler(async ({ context }) => {
    const dataModel = await context.authInfo.dataModelRepository.getDataModel();
    const dataModelWithOptions = (await Promise.all(
      dataModel.map<Promise<TableModelWithOptions>>((table) =>
        context.authInfo.dataModelRepository.getDataModelTableOptions(table.id).then((options) => {
          return mergeDataModelWithTableOptions(table, options);
        }),
      ),
    )) satisfies DataModelWithTableOptions;
    return { dataModel: dataModelWithOptions };
  });

export const getTableOptionsFn = createServerFn({ method: 'GET' })
  .middleware([authMiddleware])
  .inputValidator(z.object({ tableId: z.string() }))
  .handler(async ({ context, data }) => {
    const tableOptions = await context.authInfo.dataModelRepository.getDataModelTableOptions(data.tableId);
    return { tableOptions };
  });

export const getObjectDetailsFn = createServerFn({ method: 'GET' })
  .middleware([authMiddleware])
  .inputValidator(z.object({ objectType: z.string(), objectId: z.string() }))
  .handler(async ({ context, data }) => {
    return context.authInfo.dataModelRepository.getIngestedObject(data.objectType, data.objectId);
  });

export const getObjectCasesFn = createServerFn({ method: 'GET' })
  .middleware([authMiddleware])
  .inputValidator(z.object({ objectType: z.string(), objectId: z.string() }))
  .handler(async ({ context, data }) => {
    const cases = await context.authInfo.dataModelRepository.getCasesForObject(data.objectType, data.objectId);
    return { cases } as { cases: Case[] };
  });

export const getAnnotationsFn = createServerFn({ method: 'GET' })
  .middleware([authMiddleware])
  .inputValidator(z.object({ objectType: z.string(), objectId: z.string(), loadThumbnails: z.boolean().optional() }))
  .handler(async ({ context, data }) => {
    const annotations = await context.authInfo.dataModelRepository.getAnnotationsByTableNameAndObjectId(
      data.objectType,
      data.objectId,
      data.loadThumbnails ?? false,
    );
    return { annotations };
  });

export const getHierarchyFn = createServerFn({ method: 'GET' })
  .middleware([authMiddleware])
  .inputValidator(z.object({ objectType: z.string(), objectId: z.string(), showAll: z.boolean().optional() }))
  .handler(async ({ context, data }) => {
    const { dataModelRepository } = context.authInfo;
    const { objectType, objectId } = data;

    const dataModel = await dataModelRepository.getDataModel();
    const baseObject = await dataModelRepository.getIngestedObject(objectType, objectId);
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

    await retrieveChildren(
      objectType,
      baseObject,
      baseObjectTable.navigationOptions,
      dataModelRepository,
      baseObjectHierarchyNode,
    );

    for (const link of baseObjectParentsTables) {
      if (link.parentFieldName !== 'object_id') continue;
      const fieldValue = baseObject.data[link.childFieldName];
      if (typeof fieldValue !== 'string' && typeof fieldValue !== 'number') continue;

      const parentTableName = link.parentTableName;
      const parentObjectTable = dataModel.find((table) => table.name === parentTableName);
      if (!parentObjectTable) continue;

      try {
        const parentObject = await dataModelRepository.getIngestedObject(
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
            dataModelRepository,
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
  .inputValidator(listObjectsInputSchema)
  .handler(async ({ context, data }) => {
    const { tableName, sourceTableName, filterFieldName, filterFieldValue, orderingFieldName, limit, offsetId } = data;
    const clientDataListResponse = await context.authInfo.dataModelRepository.listClientObjects({
      tableName,
      body: {
        explorationOptions: { sourceTableName, filterFieldName, filterFieldValue, orderingFieldName },
        ...(limit !== undefined ? { limit } : {}),
        ...(offsetId !== undefined ? { offsetId } : {}),
      },
    });
    return { clientDataListResponse } as { clientDataListResponse: ClientDataListResponse };
  });

export const listArchetypesFn = createServerFn({ method: 'GET' })
  .middleware([authMiddleware])
  .handler(async ({ context }) => {
    const { archetypes } = await context.authInfo.apiClient.listArchetypes();
    return archetypes;
  });

// ---- Data model mutations - OLD ----

export class TableMutationError extends Error {
  status: number;
  constructor(status: number, message: string) {
    super(message);
    this.status = status;
  }
}

export const createTableFn = createServerFn({ method: 'POST' })
  .middleware([authMiddleware])
  .inputValidator(createTableValueSchema)
  .handler(async ({ context, data }) => {
    const request = getRequest();
    const t = await context.services.i18nextService.getFixedT(request, ['common', 'data']);

    try {
      return await context.authInfo.dataModelRepository.createTable(data);
    } catch (error) {
      const mutError = getTableMutationError(error, t, {
        conflictMessage: isStatusConflictHttpError(error) ? t('common:errors.data.duplicate_table_name') : undefined,
      });

      throw mutError;
    }
  });

export const deleteTableFn = createServerFn({ method: 'POST' })
  .middleware([authMiddleware])
  .inputValidator(deleteTablePayloadSchema)
  .handler(async ({ context, data }) => {
    const request = getRequest();
    const t = await context.services.i18nextService.getFixedT(request, ['common']);

    try {
      return context.authInfo.dataModelRepository.deleteTable(data.tableId, { perform: data.perform });
    } catch (error) {
      const mutError = getTableMutationError(error, t);
      throw mutError;
    }
  });

export const createNavigationOptionFn = createServerFn({ method: 'POST' })
  .middleware([authMiddleware])
  .inputValidator(z.object({ tableId: z.string(), ...createNavigationOptionSchema.shape }))
  .handler(async ({ context, data }) => {
    const { tableId, ...options } = data;
    try {
      await context.authInfo.dataModelRepository.createNavigationOption(tableId, options);
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
  .inputValidator(applyArchetypePayloadSchema)
  .handler(async ({ context, data }) => {
    try {
      await context.authInfo.apiClient.applyArchetype({ name: data.name }, {});
      return { success: true };
    } catch {
      return { success: false };
    }
  });

// ---- Data model mutation - NEW ----

export const editSemanticTableFn = createServerFn({ method: 'POST' })
  .middleware([authMiddleware])
  .inputValidator(editSemanticTablePayloadSchema)
  .handler(async ({ context, data }) => {
    const request = getRequest();
    const t = await context.services.i18nextService.getFixedT(request, ['common', 'data']);

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

      await context.authInfo.dataModelRepository.patchDataModelTable(data.tableId, patchBody);
    } catch (error) {
      const mutError = getTableMutationError(error, t);
      throw mutError;
    }
  });

// ---- Annotations ----

export const createAnnotationFn = createServerFn({ method: 'POST' })
  .middleware([authMiddleware])
  .inputValidator((data: unknown) => {
    if (!(data instanceof FormData)) throw new Error('Expected FormData');
    return data;
  })
  .handler(async ({ context, data: formData }) => {
    const request = getRequest();
    const authSession = await useAuthSession();

    const [err, raw] = await tryit(async (req: Request) => {
      const contentLength = req.headers.get('content-length');
      if (contentLength && parseInt(contentLength, 10) > MAX_FILE_SIZE) {
        throw new Error('File too large');
      }
      return formData;
    })(request);

    if (err) {
      return { success: false, error: 'file_too_large' as const };
    }

    const token = authSession.data.authToken?.access_token;
    if (!token) throw new Error('Not authenticated');

    const {
      data: parsedData,
      success,
      error,
    } = createAnnotationPayloadSchema.safeParse(
      decode(raw, {
        arrays: ['payload.files', 'payload.addedTags', 'payload.removedAnnotations', 'payload.addedCategories'],
      }),
    );

    if (!success) {
      return { success: false, errors: z.treeifyError(error) };
    }

    try {
      return await match(parsedData)
        .with({ type: 'comment' }, async ({ payload: { text }, ...d }) => {
          await context.authInfo.dataModelRepository.createAnnotation(d.tableName, d.objectId, {
            type: 'comment',
            caseId: d.caseId,
            payload: { text },
          });
          return { success: true };
        })
        .with({ type: 'tag' }, async ({ payload: { addedTags = [], removedAnnotations = [] }, ...d }) => {
          await Promise.all([
            ...addedTags.map((tagAdded) =>
              context.authInfo.dataModelRepository.createAnnotation(d.tableName, d.objectId, {
                type: 'tag',
                caseId: d.caseId,
                payload: { tagId: tagAdded },
              }),
            ),
            ...removedAnnotations.map((annotationId) =>
              context.authInfo.dataModelRepository.deleteAnnotation(annotationId),
            ),
          ]);
          return { success: true };
        })
        .with({ type: 'risk_tag' }, async ({ payload: { addedCategories = [], removedAnnotations = [] }, ...d }) => {
          await Promise.all([
            ...addedCategories.map((categoryAdded) =>
              context.authInfo.dataModelRepository.createAnnotation(d.tableName, d.objectId, {
                type: 'risk_tag',
                caseId: d.caseId,
                payload: { tag: categoryAdded },
              }),
            ),
            ...removedAnnotations.map((annotationId) =>
              context.authInfo.dataModelRepository.deleteAnnotation(annotationId),
            ),
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
  .inputValidator(z.object({ annotationId: z.string() }))
  .handler(async ({ context, data }) => {
    try {
      await context.authInfo.dataModelRepository.deleteAnnotation(data.annotationId);
      return { success: true };
    } catch {
      return { success: false, errors: [] };
    }
  });

// ---- Ingestion upload ----

export const uploadIngestionDataFn = createServerFn({ method: 'POST' })
  .middleware([authMiddleware])
  .inputValidator((data: unknown) => {
    if (!(data instanceof FormData)) throw new Error('Expected FormData');
    return data;
  })
  .handler(async ({ context, data }) => {
    const objectType = data.get('objectType') as string | null;
    if (!objectType) return new Response(null, { status: 400 });

    const token = await context.authInfo.tokenService.getToken();

    const backendData = new FormData();
    for (const [key, value] of data.entries()) {
      if (key !== 'objectType') backendData.append(key, value);
    }

    const upstream = await fetch(
      `${getServerEnv('MARBLE_API_URL')}${getIngestionDataBatchUploadEndpoint(objectType)}`,
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
  .inputValidator(z.object({ objectType: z.string() }))
  .handler(async ({ context, data: { objectType } }) => {
    return context.authInfo.apiClient.getIngestionUploadLogs(objectType);
  });

// ---- Org import ----

export const importOrgFn = createServerFn({ method: 'POST' })
  .middleware([authMiddleware])
  .inputValidator(z.object({ body: z.unknown() }))
  .handler(async ({ context, data }) => {
    try {
      await context.authInfo.organization.importOrganization(data.body);
      return { success: true };
    } catch (error) {
      console.error('[import-org] Import failed:', error);
      return { success: false };
    }
  });

export const importOrgFileFn = createServerFn({ method: 'POST' })
  .middleware([authMiddleware])
  .inputValidator((data: unknown) => {
    if (!(data instanceof FormData)) throw new Error('Expected FormData');
    return data;
  })
  .handler(async ({ context, data }) => {
    const file = data.get('file');
    if (!(file instanceof Blob)) {
      return { success: false };
    }

    try {
      await context.authInfo.organization.importOrganizationFromFile(file);
      return { success: true };
    } catch (error) {
      console.error('[import-org-file] Import failed:', error);
      return { success: false };
    }
  });

// ---- Hierarchy helper ----

async function retrieveChildren(
  objectType: string,
  object: { data: Record<string, DataModelObjectValue> },
  navigationOptions:
    | { filterFieldName: string; sourceFieldName: string; orderingFieldName: string; targetTableName: string }[]
    | undefined,
  dataModelRepository: {
    listClientObjects(args: {
      tableName: string;
      body: {
        explorationOptions: {
          sourceTableName: string;
          filterFieldName: string;
          filterFieldValue: string | number;
          orderingFieldName: string;
        };
        limit: number;
      };
    }): Promise<{ data: { data: Record<string, DataModelObjectValue> }[] }>;
  },
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

    const data = await dataModelRepository.listClientObjects({
      tableName: navigationOption.targetTableName,
      body: requestBody,
    });

    if (data.data.length === 0) continue;

    hierarchyNode.children.push({
      objectType: navigationOption.targetTableName,
      data: data.data.map((item) => item.data),
    });
  }
}
