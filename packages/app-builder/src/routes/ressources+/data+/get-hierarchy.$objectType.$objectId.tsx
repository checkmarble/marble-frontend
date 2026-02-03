import { createServerFn, data } from '@app-builder/core/requests';
import { authMiddleware } from '@app-builder/middlewares/auth-middleware';
import { handleRedirectMiddleware } from '@app-builder/middlewares/handle-redirect-middleware';
import { ClientDataListRequestBody, LinkToSingle } from '@app-builder/models';
import invariant from 'tiny-invariant';

type HierarchyLeaf = {
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

export const loader = createServerFn([handleRedirectMiddleware, authMiddleware], async ({ context, params }) => {
  const { objectType, objectId } = params;
  invariant(objectType, 'Object type is required');
  invariant(objectId, 'Object ID is required');

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

  if (baseObjectTable.navigationOptions) {
    for (const navigationOption of baseObjectTable.navigationOptions) {
      const requestBody: ClientDataListRequestBody = {
        explorationOptions: {
          sourceTableName: objectType,
          filterFieldName: navigationOption.filterFieldName,
          filterFieldValue: baseObject.data[navigationOption.sourceFieldName] as string | number,
          orderingFieldName: navigationOption.orderingFieldName,
        },
        limit: 5,
      };

      const data = await context.authInfo.dataModelRepository.listClientObjects({
        tableName: navigationOption.targetTableName,
        body: requestBody,
      });

      baseObjectHierarchyNode.children.push({
        objectType: navigationOption.targetTableName,
        data: data.data.map((item) => item.data),
      });
    }
  }

  for (const link of baseObjectParentsTables) {
    if (link.parentFieldName !== 'object_id') continue;
    const fieldValue = baseObject.data[link.childFieldName];

    if (typeof fieldValue !== 'string' && typeof fieldValue !== 'number') continue;

    console.dir(baseObject.data, { depth: null });
    console.dir(link, { depth: null });
    console.dir(baseObject.data[link.childFieldName] as string, { depth: null });

    const parentObject = await context.authInfo.dataModelRepository.getIngestedObject(
      link.parentTableName,
      baseObject.data[link.childFieldName] as string,
    );
    baseObjectHierarchyNode.parents.push({
      objectType: link.parentTableName,
      objectId: parentObject.data['object_id'] as string,
      data: parentObject.data,
      children: [],
    });
  }

  return data({ hierarchy: baseObjectHierarchyNode });
});
