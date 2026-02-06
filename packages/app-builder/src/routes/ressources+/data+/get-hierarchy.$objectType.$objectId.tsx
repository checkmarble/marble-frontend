import { createServerFn, data } from '@app-builder/core/requests';
import { authMiddleware } from '@app-builder/middlewares/auth-middleware';
import { handleRedirectMiddleware } from '@app-builder/middlewares/handle-redirect-middleware';
import { ClientDataListRequestBody, DataModelObject, LinkToSingle, NavigationOption } from '@app-builder/models';
import { DataModelRepository } from '@app-builder/repositories/DataModelRepository';
import invariant from 'tiny-invariant';
import { z } from 'zod/v4';

export type HierarchyLeaf = {
  objectType: string;
  data: Record<string, unknown>[];
};

export type HierarchyNode = {
  objectType: string;
  objectId: string;
  data: Record<string, unknown>;
  children: HierarchyLeaf[];
};

export type HierarchyTreeBase = HierarchyNode & {
  parents: HierarchyNode[];
};

const queryParams = z.object({
  showAll: z.stringbool().optional(),
});

export const loader = createServerFn(
  [handleRedirectMiddleware, authMiddleware],
  async ({ request, context, params }) => {
    const { objectType, objectId } = params;
    invariant(objectType, 'Object type is required');
    invariant(objectId, 'Object ID is required');

    const url = new URL(request.url);
    const searchParams = new URLSearchParams(url.search);
    const parsedSearchParams = queryParams.parse(Object.fromEntries(searchParams));

    const dataModel = await context.authInfo.dataModelRepository.getDataModel();
    const baseObject = await context.authInfo.dataModelRepository.getIngestedObject(objectType, objectId);
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

    const baseObjectParentsTables: LinkToSingle[] = [];
    for (const table of dataModel) {
      for (const link of table.linksToSingle) {
        if (link.childTableName === objectType) {
          baseObjectParentsTables.push(link);
        }
      }
    }

    await retrieveChildren(
      objectType,
      baseObject,
      baseObjectTable.navigationOptions,
      context.authInfo.dataModelRepository,
      baseObjectHierarchyNode,
    );

    for (const link of baseObjectParentsTables) {
      if (link.parentFieldName !== 'object_id') continue;
      const fieldValue = baseObject.data[link.childFieldName];

      if (typeof fieldValue !== 'string' && typeof fieldValue !== 'number') {
        continue;
      }

      const parentTableName = link.parentTableName;
      const parentObjectTable = dataModel.find((table) => table.name === parentTableName);

      if (!parentObjectTable) {
        continue;
      }

      const parentObject = await context.authInfo.dataModelRepository.getIngestedObject(
        parentTableName,
        baseObject.data[link.childFieldName] as string,
      );

      const parentObjectHierarchyNode = {
        objectType: link.parentTableName,
        objectId: parentObject.data['object_id'] as string,
        data: parentObject.data,
        children: [],
      };

      if (parsedSearchParams.showAll) {
        await retrieveChildren(
          link.parentTableName,
          parentObject,
          parentObjectTable.navigationOptions,
          context.authInfo.dataModelRepository,
          parentObjectHierarchyNode,
        );

        console.log(parentObjectHierarchyNode);
      }

      baseObjectHierarchyNode.parents.push(parentObjectHierarchyNode);
    }

    return data({ hierarchy: baseObjectHierarchyNode });
  },
);

async function retrieveChildren(
  objectType: string,
  object: DataModelObject,
  navigationOptions: NavigationOption[] | undefined,
  dataModelRepository: DataModelRepository,
  hierarchyNode: HierarchyNode,
) {
  if (!navigationOptions) {
    return;
  }

  for (const navigationOption of navigationOptions) {
    const requestBody: ClientDataListRequestBody = {
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

    if (data.data.length === 0) {
      continue;
    }

    hierarchyNode.children.push({
      objectType: navigationOption.targetTableName,
      data: data.data.map((item) => item.data),
    });
  }
}
