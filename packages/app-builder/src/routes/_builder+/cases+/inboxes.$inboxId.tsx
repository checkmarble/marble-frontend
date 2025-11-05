import { paginationSchema } from '@app-builder/components';
import { casesI18n } from '@app-builder/components/Cases';
import { type CasesFilters, casesFiltersSchema } from '@app-builder/components/Cases/Filters';
import { InboxPage } from '@app-builder/components/Cases/InboxPage';
import { MY_INBOX_ID } from '@app-builder/constants/inboxes';
import { useAgnosticNavigation } from '@app-builder/contexts/AgnosticNavigationContext';
import { useCursorPaginatedFetcher } from '@app-builder/hooks/useCursorPaginatedFetcher';
import { isForbiddenHttpError, isNotFoundHttpError } from '@app-builder/models';
import { type Case, type CaseStatus, caseStatuses } from '@app-builder/models/cases';
import { type PaginatedResponse, type PaginationParams } from '@app-builder/models/pagination';
import {
  type CaseFilters,
  DEFAULT_CASE_PAGINATION_SIZE,
} from '@app-builder/repositories/CaseRepository';
import { initServerServices } from '@app-builder/services/init.server';
import { badRequest } from '@app-builder/utils/http/http-responses';
import { parseIdParamSafe, parseQuerySafe } from '@app-builder/utils/input-validation';
import { getRoute } from '@app-builder/utils/routes';
import { fromUUIDtoSUUID } from '@app-builder/utils/short-uuid';
import { type LoaderFunctionArgs, redirect } from '@remix-run/node';
import { useLoaderData } from '@remix-run/react';
import { type Namespace } from 'i18next';
import qs from 'qs';
import { useCallback } from 'react';

export const handle = {
  i18n: ['navigation', ...casesI18n] satisfies Namespace,
};

export const buildQueryParams = (
  filters: CasesFilters,
  offsetId: string | null,
  limit: number | null,
  order: 'ASC' | 'DESC' | null,
) => {
  return {
    statuses: filters.statuses ?? [],
    name: filters.name,
    includeSnoozed: filters.includeSnoozed,
    excludeAssigned: filters.excludeAssigned,
    dateRange: filters.dateRange
      ? filters.dateRange.type === 'static'
        ? {
            type: 'static',
            endDate: filters.dateRange.endDate || null,
            startDate: filters.dateRange.startDate || null,
          }
        : {
            type: 'dynamic',
            fromNow: filters.dateRange.fromNow,
          }
      : {},
    assignee: filters.assignee,
    offsetId,
    ...(limit && { limit }),
    ...(order && { order }),
  };
};

export async function loader({ request, params }: LoaderFunctionArgs) {
  const { authService } = initServerServices(request);
  const {
    cases,
    user,
    inbox: inboxRepository,
  } = await authService.isAuthenticated(request, {
    failureRedirect: getRoute('/sign-in'),
  });

  const parsedResult = await parseIdParamSafe(params, 'inboxId');
  // The MY_INBOX_ID is not an actual inboxId, but a special case to get the cases assigned to the user
  if (!parsedResult.success && params['inboxId'] !== MY_INBOX_ID) {
    return badRequest('Invalid inbox UUID');
  }

  const inboxId = parsedResult.success ? parsedResult.data.inboxId : null;

  const parsedQuery = await parseQuerySafe(request, casesFiltersSchema);
  const parsedPaginationQuery = await parseQuerySafe(request, paginationSchema);
  if (!parsedQuery.success || !parsedPaginationQuery.success) {
    return inboxId
      ? redirect(getRoute('/cases/inboxes/:inboxId', { inboxId: fromUUIDtoSUUID(inboxId) }))
      : redirect(getRoute('/cases'));
  }

  const inboxes = await inboxRepository.listInboxes();
  let inboxUsersIds: string[] = [];
  if (inboxId) {
    const inbox = await inboxRepository.getInbox(inboxId);
    inboxUsersIds = inbox.users.map(({ userId }) => userId);
  }

  // Force the order to be ASC if not provided
  if (!parsedPaginationQuery.data.order) {
    parsedPaginationQuery.data.order = 'ASC';
  }

  if (!parsedPaginationQuery.data.limit) {
    parsedPaginationQuery.data.limit = DEFAULT_CASE_PAGINATION_SIZE;
  }

  const filtersForBackend: CaseFilters = {
    ...parsedQuery.data,
    ...parsedPaginationQuery.data,
    ...(inboxId && { inboxIds: [inboxId] }),
    // If no statuses filter is provided, we filter out closed cases
    statuses:
      (parsedQuery.data.statuses as CaseStatus[]) ??
      caseStatuses.filter((status) => status !== 'closed'),
    ...(!inboxId
      ? { assigneeId: user.actorIdentity.userId }
      : { assigneeId: parsedQuery.data.assignee }),
  };

  try {
    const caseList = await cases.listCases(filtersForBackend);

    return {
      inboxId,
      inboxes,
      inboxUsersIds,
      casesData: caseList,
      filters: parsedQuery.data,
      pagination: parsedPaginationQuery.data,
    };
  } catch (error) {
    // if inbox is deleted or user no longer have access, the user is redirected
    if (isNotFoundHttpError(error) || isForbiddenHttpError(error)) {
      return redirect(getRoute('/cases'));
    } else {
      throw error;
    }
  }
}

export default function Cases() {
  const {
    inboxId,
    inboxes,
    inboxUsersIds,
    casesData: initialCasesData,
    filters,
    pagination: initialPagination,
  } = useLoaderData<typeof loader>();

  const { data, next, previous, reset, hasPreviousPage, pageNb } = useCursorPaginatedFetcher<
    typeof loader,
    PaginatedResponse<Case>
  >({
    resourceId: inboxId ?? MY_INBOX_ID,
    transform: (fetcherData) => fetcherData.casesData,
    initialData: initialCasesData,
    getQueryParams: (cursor) =>
      buildQueryParams(
        filters,
        cursor,
        initialPagination.limit ?? null,
        initialPagination.order ?? null,
      ),
    validateData: (data) => data.items.length > 0,
  });

  const navigate = useAgnosticNavigation();
  const navigateCasesList = useCallback(
    (casesFilters: CasesFilters, pagination?: PaginationParams) => {
      if (!pagination) {
        reset();

        const pathname = getRoute('/cases/inboxes/:inboxId', {
          inboxId: inboxId ? fromUUIDtoSUUID(inboxId) : MY_INBOX_ID,
        });
        const search = qs.stringify(buildQueryParams(casesFilters, null, null, null), {
          addQueryPrefix: true,
          skipNulls: true,
        });

        navigate({ pathname, search }, { replace: true });
        return;
      }

      if (pagination.next && pagination.offsetId) {
        next(pagination.offsetId);
        return;
      }
      if (pagination.previous) {
        previous();
        return;
      }
      if (!pagination.order) {
        reset();
        return;
      }
      if (pagination.order || pagination.limit) {
        reset();
        navigate(
          {
            pathname: getRoute('/cases/inboxes/:inboxId', {
              inboxId: inboxId ? fromUUIDtoSUUID(inboxId) : MY_INBOX_ID,
            }),
            search: qs.stringify(
              buildQueryParams(casesFilters, null, pagination.limit ?? null, pagination.order),
              {
                addQueryPrefix: true,
                skipNulls: true,
              },
            ),
          },
          { replace: true },
        );
      }
    },
    [navigate, inboxId, next, previous, reset],
  );

  return (
    <InboxPage
      key={inboxId ?? MY_INBOX_ID}
      inboxId={inboxId}
      inboxes={inboxes}
      inboxUsersIds={inboxUsersIds}
      data={data}
      filters={filters}
      paginationParams={initialPagination}
      hasPreviousPage={hasPreviousPage}
      pageNb={pageNb}
      navigateCasesList={navigateCasesList}
    />
  );
}
