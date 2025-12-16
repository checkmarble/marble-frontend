import { createServerFn, data } from '@app-builder/core/requests';
import { authMiddleware } from '@app-builder/middlewares/auth-middleware';
import { isAdmin } from '@app-builder/models';
import { forbidden } from '@app-builder/utils/http/http-responses';
import { parseQuerySafe } from '@app-builder/utils/input-validation';
import { Temporal } from 'temporal-polyfill';
import { z } from 'zod';

const dateRangeSchema = z.discriminatedUnion('type', [
  z.object({
    type: z.literal('dynamic'),
    fromNow: z.string(),
  }),
  z.object({
    type: z.literal('static'),
    startDate: z.string(),
    endDate: z.string(),
  }),
]);

const filtersSchema = z.object({
  dateRange: dateRangeSchema.optional(),
  userId: z.string().optional(),
  apiKeyId: z.string().optional(),
  table: z.string().optional(),
  entityId: z.string().optional(),
});

const paginationSchema = z.object({
  limit: z.coerce.number().optional().default(25),
  after: z.string().optional(),
});

export const loader = createServerFn([authMiddleware], async function resourcesAuditEventsLoader({ request, context }) {
  const { user, auditEvents } = context.authInfo;

  if (!isAdmin(user)) {
    throw forbidden('Admin access required');
  }

  const parsedFilters = await parseQuerySafe(request, filtersSchema);
  const parsedPagination = await parseQuerySafe(request, paginationSchema);

  if (!parsedFilters.success || !parsedPagination.success) {
    return data({ data: { events: [], hasNextPage: false } });
  }

  // Build API parameters from filters
  let from: string | undefined;
  let to: string | undefined;

  if (parsedFilters.data.dateRange) {
    if (parsedFilters.data.dateRange.type === 'dynamic') {
      const now = Temporal.Now.zonedDateTimeISO();
      from = now.add(parsedFilters.data.dateRange.fromNow).toInstant().toString();
      to = now.toInstant().toString();
    } else {
      from = parsedFilters.data.dateRange.startDate;
      to = parsedFilters.data.dateRange.endDate;
    }
  }

  const response = await auditEvents.listAuditEvents({
    from,
    to,
    userId: parsedFilters.data.userId,
    apiKeyId: parsedFilters.data.apiKeyId,
    table: parsedFilters.data.table,
    entityId: parsedFilters.data.entityId,
    limit: parsedPagination.data.limit,
    after: parsedPagination.data.after,
  });

  return data({ data: response });
});
