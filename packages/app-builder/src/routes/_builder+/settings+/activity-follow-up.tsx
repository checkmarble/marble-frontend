import { ActivityFollowUpPage } from '@app-builder/components/Settings/AuditEvents/ActivityFollowUpPage';
import { auditEventsFiltersSchema } from '@app-builder/components/Settings/AuditEvents/Filters/filters';
import { useAgnosticNavigation } from '@app-builder/contexts/AgnosticNavigationContext';
import { createServerFn } from '@app-builder/core/requests';
import { authMiddleware } from '@app-builder/middlewares/auth-middleware';
import { isAdmin } from '@app-builder/models';
import { getRoute } from '@app-builder/utils/routes';
import { redirect, useLoaderData } from '@remix-run/react';
import { type Namespace } from 'i18next';
import QueryString from 'qs';
import { useTranslation } from 'react-i18next';
import { Temporal } from 'temporal-polyfill';
import { z } from 'zod';

export const handle = {
  i18n: ['settings', 'common', 'filters'] satisfies Namespace,
  BreadCrumb: function AuditEventsBreadcrumb() {
    const { t } = useTranslation(['settings']);
    return <span>{t('settings:activity_follow_up')}</span>;
  },
};

const DEFAULT_LIMIT = 25;

const defaultFromNow = Temporal.Duration.from({ days: -7 }).toString();

function getDefaultDateRange() {
  const now = Temporal.Now.zonedDateTimeISO();
  const from = now.add(defaultFromNow).toInstant().toString();
  const to = now.toInstant().toString();
  return { from, to };
}

function base64ToBytes(base64: string) {
  const binString = atob(base64);
  return Uint8Array.from(binString, (m) => m.codePointAt(0)!);
}

function decodeBase64Query(query: string) {
  try {
    const decodedQuery = new TextDecoder().decode(base64ToBytes(query));
    return JSON.parse(decodedQuery !== '' ? decodedQuery : '{}');
  } catch {
    return {};
  }
}

const pageQueryStringSchema = z.object({
  q: z.string().optional().default(''),
  limit: z.coerce.number().optional().default(DEFAULT_LIMIT),
  after: z.string().optional(),
});

export const loader = createServerFn([authMiddleware], async function activityFollowUpLoader({ context, request }) {
  const { user, auditEvents } = context.authInfo;

  if (!isAdmin(user)) {
    return redirect(getRoute('/'));
  }

  const url = new URL(request.url);
  const searchParams = new URLSearchParams(url.search);
  const parsedSearchParams = pageQueryStringSchema.parse(Object.fromEntries(searchParams));

  // Decode the base64 query to get filter values
  const decodedFilters = decodeBase64Query(parsedSearchParams.q);
  const filters = auditEventsFiltersSchema.safeParse(decodedFilters);

  // Build API parameters from filters
  let from: string;
  let to: string;
  let table: string | undefined;
  let entityId: string | undefined;

  if (filters.success && filters.data.dateRange) {
    if (filters.data.dateRange.type === 'dynamic') {
      const now = Temporal.Now.zonedDateTimeISO();
      from = now.add(filters.data.dateRange.fromNow).toInstant().toString();
      to = now.toInstant().toString();
    } else {
      from = filters.data.dateRange.startDate;
      to = filters.data.dateRange.endDate;
    }
  } else {
    // Default to last 7 days
    const defaultRange = getDefaultDateRange();
    from = defaultRange.from;
    to = defaultRange.to;
  }

  if (filters.success) {
    table = filters.data.table;
    entityId = filters.data.entityId;
  }

  const response = await auditEvents.listAuditEvents({
    from,
    to,
    table,
    entityId,
    limit: parsedSearchParams.limit,
    after: parsedSearchParams.after,
  });

  return {
    auditEvents: response.events,
    hasNextPage: response.hasNextPage,
    query: parsedSearchParams.q,
    limit: parsedSearchParams.limit,
    after: parsedSearchParams.after,
  };
});

export default function ActivityFollowUp() {
  const navigate = useAgnosticNavigation();
  const { auditEvents, hasNextPage, query, limit, after } = useLoaderData<typeof loader>();

  const updatePage = (newQuery: string, newLimit: number, newAfter?: string) => {
    const qs = QueryString.stringify(
      {
        q: newQuery !== '' ? newQuery : undefined,
        limit: newLimit !== DEFAULT_LIMIT ? newLimit : undefined,
        after: newAfter,
      },
      { addQueryPrefix: true, skipNulls: true },
    );
    navigate({ search: qs }, { replace: true });
  };

  return (
    <ActivityFollowUpPage
      auditEvents={auditEvents}
      hasNextPage={hasNextPage}
      query={query}
      limit={limit}
      after={after}
      updatePage={updatePage}
    />
  );
}
