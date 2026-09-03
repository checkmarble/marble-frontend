import { authMiddleware } from '@app-builder/middlewares/auth-middleware';
import { type CurrentUser } from '@app-builder/models';
import {
  createGraphRelationPayloadSchema,
  deleteGraphRelationPayloadSchema,
  generateGraphPayloadSchema,
} from '@app-builder/schemas/graph';
import { createServerFn } from '@tanstack/react-start';

function forbidUnlessCanEditDataModel(user: CurrentUser) {
  if (!user.permissions.canEditDataModel) {
    throw new Response(null, { status: 403, statusText: 'Forbidden' });
  }
}

export const listGraphRelationsFn = createServerFn({ method: 'GET' })
  .middleware([authMiddleware])
  .handler(async ({ context }) => {
    return context.authInfo.graph.listRelations();
  });

export const createGraphRelationFn = createServerFn({ method: 'POST' })
  .middleware([authMiddleware])
  .validator(createGraphRelationPayloadSchema)
  .handler(async ({ context, data }) => {
    forbidUnlessCanEditDataModel(context.authInfo.user);
    return context.authInfo.graph.createRelation(data);
  });

export const deleteGraphRelationFn = createServerFn({ method: 'POST' })
  .middleware([authMiddleware])
  .validator(deleteGraphRelationPayloadSchema)
  .handler(async ({ context, data }) => {
    forbidUnlessCanEditDataModel(context.authInfo.user);
    await context.authInfo.graph.deleteRelation(data.relationId);
  });

export const generateGraphFn = createServerFn({ method: 'POST' })
  .middleware([authMiddleware])
  .validator(generateGraphPayloadSchema)
  .handler(async ({ context, data }) => {
    return context.authInfo.graph.generateGraph(data.recordType, data.recordId, {
      degrees: data.degrees,
      types: data.types,
      skipSameFieldRelations: data.skip_same_field_relations,
      sameFieldRelations: data.same_field_relations,
    });
  });
