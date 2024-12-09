import {
  CursorPaginationButtons,
  Page,
  paginationSchema,
} from '@app-builder/components';
import { casesI18n, CasesList } from '@app-builder/components/Cases';
import { CaseRightPanel } from '@app-builder/components/Cases/CaseRightPanel';
import {
  type CasesFilters,
  CasesFiltersBar,
  CasesFiltersMenu,
  CasesFiltersProvider,
  casesFiltersSchema,
} from '@app-builder/components/Cases/Filters';
import { casesFilterNames } from '@app-builder/components/Cases/Filters/filters';
import { FiltersButton } from '@app-builder/components/Filters';
import { useCursorPaginatedFetcher } from '@app-builder/hooks/useCursorPaginatedFetcher';
import { isForbiddenHttpError, isNotFoundHttpError } from '@app-builder/models';
import { type Case } from '@app-builder/models/cases';
import {
  type PaginatedResponse,
  type PaginationParams,
} from '@app-builder/models/pagination';
import { type CaseFilters } from '@app-builder/repositories/CaseRepository';
import { serverServices } from '@app-builder/services/init.server';
import { parseQuerySafe } from '@app-builder/utils/input-validation';
import { getRoute } from '@app-builder/utils/routes';
import { fromParams, fromUUID, useParam } from '@app-builder/utils/short-uuid';
import { json, type LoaderFunctionArgs, redirect } from '@remix-run/node';
import { useLoaderData, useNavigate } from '@remix-run/react';
import { type Namespace } from 'i18next';
import qs from 'qs';
import { useCallback, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from 'ui-design-system';
import { Icon } from 'ui-icons';

export const handle = {
  i18n: ['navigation', ...casesI18n] satisfies Namespace,
};

export const buildQueryParams = (
  filters: CasesFilters,
  offsetId: string | null,
) => {
  return {
    statuses: filters.statuses ?? [],
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
  };
};

export async function loader({ request, params }: LoaderFunctionArgs) {
  const { authService } = serverServices;
  const { cases } = await authService.isAuthenticated(request, {
    failureRedirect: getRoute('/sign-in'),
  });

  const inboxId = fromParams(params, 'inboxId');

  const parsedQuery = await parseQuerySafe(request, casesFiltersSchema);
  const parsedPaginationQuery = await parseQuerySafe(request, paginationSchema);
  if (!parsedQuery.success || !parsedPaginationQuery.success) {
    return redirect(getRoute('/cases/inboxes/:inboxId', { inboxId }));
  }

  const filters = parsedQuery.data;
  const filtersForBackend: CaseFilters = {
    ...parsedQuery.data,
    ...parsedPaginationQuery.data,
    inboxIds: [inboxId],
  };
  try {
    const caseList = await cases.listCases(filtersForBackend);

    return json({ casesData: caseList, filters });
  } catch (error) {
    // if inbox is deleted or user no longer have access, the user is redirected
    if (isNotFoundHttpError(error) || isForbiddenHttpError(error)) {
      return redirect(getRoute('/cases/'));
    } else {
      throw error;
    }
  }
}

export default function Cases() {
  const { t } = useTranslation(casesI18n);
  const { casesData: initialCasesData, filters } =
    useLoaderData<typeof loader>();
  const inboxId = useParam('inboxId');

  const {
    data,
    pagination: paginationState,
    next,
    previous,
    reset,
    update,
  } = useCursorPaginatedFetcher<typeof loader, PaginatedResponse<Case>>({
    transform: (fetcherData) => fetcherData.casesData,
    initialData: initialCasesData,
    getQueryParams: (cursor) => buildQueryParams(filters, cursor),
    validateData: (data) => data.items.length > 0,
  });
  const { items: cases, ...pagination } = data;

  const [previousInitialCasesData, setPreviousInitialCasesData] =
    useState(initialCasesData);
  if (
    initialCasesData !== previousInitialCasesData &&
    paginationState.isPristine
  ) {
    setPreviousInitialCasesData(initialCasesData);
    update(initialCasesData);
  }

  const navigate = useNavigate();
  const navigateCasesList = useCallback(
    (casesFilters: CasesFilters, pagination?: PaginationParams) => {
      if (!pagination) {
        reset();
        navigate(
          {
            pathname: getRoute('/cases/inboxes/:inboxId', {
              inboxId: fromUUID(inboxId),
            }),
            search: qs.stringify(buildQueryParams(casesFilters, null), {
              addQueryPrefix: true,
              skipNulls: true,
            }),
          },
          { replace: true },
        );
        return;
      }

      if (pagination.next && pagination.offsetId) {
        next(pagination.offsetId);
      }
      if (pagination.previous) {
        previous();
      }
    },
    [navigate, inboxId, next, previous, reset],
  );

  return (
    <CaseRightPanel.Root>
      <Page.Container>
        <Page.Content>
          <div className="flex flex-col gap-4">
            <CasesFiltersProvider
              submitCasesFilters={navigateCasesList}
              filterValues={filters}
            >
              <div className="flex justify-end gap-4">
                <CasesFiltersMenu filterNames={casesFilterNames}>
                  <FiltersButton />
                </CasesFiltersMenu>
                <CaseRightPanel.Trigger asChild data={{ inboxId }}>
                  <Button>
                    <Icon icon="plus" className="size-5" />
                    {t('cases:case.new_case')}
                  </Button>
                </CaseRightPanel.Trigger>
              </div>
              <CasesFiltersBar />
              <CasesList cases={cases} className="max-h-[60dvh]" />
              <CursorPaginationButtons
                items={cases}
                onPaginationChange={(paginationParams: PaginationParams) =>
                  navigateCasesList(filters, paginationParams)
                }
                {...pagination}
              />
            </CasesFiltersProvider>
          </div>
        </Page.Content>
      </Page.Container>
    </CaseRightPanel.Root>
  );
}
