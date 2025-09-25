import { CursorPaginationButtons, Page, paginationSchema } from '@app-builder/components';
import { CasesList, casesI18n } from '@app-builder/components/Cases';
import { CaseRightPanel } from '@app-builder/components/Cases/CaseRightPanel';
import {
  type CasesFilters,
  CasesFiltersBar,
  CasesFiltersProvider,
  casesFiltersSchema,
} from '@app-builder/components/Cases/Filters';
import { InputWithButton } from '@app-builder/components/InputWithButton';
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
import { useLoaderData, useNavigate } from '@remix-run/react';
import { type Namespace } from 'i18next';
import qs from 'qs';
import { useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { omit } from 'remeda';
import { Button, cn } from 'ui-design-system';
import { Icon } from 'ui-icons';
import { z } from 'zod/v4';
import { MY_INBOX_ID } from './_index';

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
    offsetId,
    ...(limit && { limit }),
    ...(order && { order }),
  };
};

export async function loader({ request, params }: LoaderFunctionArgs) {
  const { authService } = initServerServices(request);
  const { cases, user } = await authService.isAuthenticated(request, {
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
    ...(!inboxId && { assigneeId: user.actorIdentity.userId }),
  };

  try {
    const caseList = await cases.listCases(filtersForBackend);

    return {
      inboxId,
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
  const { t } = useTranslation(casesI18n);
  const {
    inboxId,
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

  let hasAlreadyOrdered = false;

  const { items: cases, ...pagination } = data;

  const navigate = useNavigate();
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
    <CaseRightPanel.Root>
      <Page.Container>
        <Page.Content>
          <div className="flex flex-col gap-4">
            <CasesFiltersProvider submitCasesFilters={navigateCasesList} filterValues={filters}>
              <div className="flex justify-between">
                <div className="flex gap-4 items-center">
                  <InputWithButton
                    initialValue={filters.name}
                    buttonLabel={t('common:search')}
                    placeholder={t('cases:search.placeholder')}
                    label={t('cases:search.placeholder')}
                    onClear={() => {
                      navigateCasesList({ ...filters, name: undefined });
                    }}
                    onChange={(value) => {
                      navigateCasesList({ ...filters, name: value });
                    }}
                    validator={z.string().min(1)}
                    icon="search"
                  />
                  {t('common:or')}
                  <InputWithButton
                    buttonLabel={t('cases:access_by_id.button_label')}
                    placeholder={t('cases:access_by_id.placeholder')}
                    label={t('cases:access_by_id.placeholder')}
                    onChange={(value) => {
                      navigate(getRoute('/cases/:caseId', { caseId: fromUUIDtoSUUID(value) }));
                    }}
                    validator={z.uuid()}
                    icon="arrow-up-right"
                    inputClassName="w-80"
                  />
                </div>
                <div className="flex gap-4">
                  <CaseRightPanel.Trigger asChild data={{ inboxId }}>
                    <Button>
                      <Icon icon="plus" className="size-5" />
                      {t('cases:case.new_case')}
                    </Button>
                  </CaseRightPanel.Trigger>
                </div>
              </div>
              <CasesFiltersBar excludedFilters={!inboxId ? ['excludeAssigned'] : undefined} />
              <CasesList
                key={inboxId}
                cases={cases}
                className="max-h-[60dvh]"
                initSorting={[
                  {
                    id: initialPagination.sorting ?? 'created_at',
                    desc: initialPagination.order === 'DESC',
                  },
                ]}
                onSortingChange={(state) => {
                  const paginationParams: PaginationParams = {
                    ...omit(initialPagination, ['order']),
                    order: state[0]?.desc ? 'DESC' : 'ASC',
                  };

                  if (hasAlreadyOrdered) navigateCasesList(filters, paginationParams);
                  hasAlreadyOrdered = true;
                }}
              />
              <div className="flex justify-between gap-8">
                <div className="flex gap-2 items-center">
                  <span>{t('cases:list.results_per_page')}</span>
                  {[25, 50, 100].map((limit) => {
                    const isActive = limit === initialPagination.limit;
                    return (
                      <Button
                        key={`pagination-limit-${limit}`}
                        variant="secondary"
                        className={cn(isActive && 'border-purple-65 text-purple-65')}
                        onClick={() => {
                          if (!isActive) {
                            navigateCasesList(filters, { ...initialPagination, limit });
                          }
                        }}
                      >
                        {limit}
                      </Button>
                    );
                  })}
                </div>
                <CursorPaginationButtons
                  items={cases}
                  onPaginationChange={(paginationParams: PaginationParams) =>
                    navigateCasesList(filters, paginationParams)
                  }
                  boundariesDisplay="ranks"
                  hasPreviousPage={hasPreviousPage}
                  pageNb={pageNb}
                  itemsPerPage={initialPagination.limit ?? DEFAULT_CASE_PAGINATION_SIZE}
                  {...pagination}
                />
              </div>
            </CasesFiltersProvider>
          </div>
        </Page.Content>
      </Page.Container>
    </CaseRightPanel.Root>
  );
}
