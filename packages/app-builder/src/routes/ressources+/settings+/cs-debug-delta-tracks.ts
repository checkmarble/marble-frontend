import { createServerFn, data } from '@app-builder/core/requests';
import { authMiddleware } from '@app-builder/middlewares/auth-middleware';
import { isAdmin } from '@app-builder/models';
import { forbidden } from '@app-builder/utils/http/http-responses';
import { parseQuerySafe } from '@app-builder/utils/input-validation';
import { z } from 'zod';

const querySchema = z.object({
  limit: z.coerce.number().optional().default(25),
  offset_id: z.string().optional(),
  sorting: z.string().optional().default('created_at'),
  order: z.enum(['ASC', 'DESC']).optional().default('DESC'),
});

export const loader = createServerFn([authMiddleware], async function csDebugDeltaTracksLoader({ request, context }) {
  const { user, continuousScreening } = context.authInfo;

  if (!isAdmin(user)) {
    throw forbidden('Admin access required');
  }

  const parsed = await parseQuerySafe(request, querySchema);

  if (!parsed.success) {
    return data({ data: { hasNextPage: false, items: [] } });
  }

  const result = await continuousScreening.listDebugDeltaTracks({
    offsetId: parsed.data.offset_id,
    sorting: parsed.data.sorting,
    order: parsed.data.order,
    limit: parsed.data.limit,
  });

  return data({ data: result });
});
