import { CursorPaginationButtons, Page, paginationSchema } from '@app-builder/components';
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
import { FormLabel } from '@app-builder/components/Form/Tanstack/FormLabel';
import { useCursorPaginatedFetcher } from '@app-builder/hooks/useCursorPaginatedFetcher';
import { isForbiddenHttpError, isNotFoundHttpError } from '@app-builder/models';
import { type Case, type CaseStatus } from '@app-builder/models/cases';
import { type PaginatedResponse, type PaginationParams } from '@app-builder/models/pagination';
import { type CaseFilters } from '@app-builder/repositories/CaseRepository';
import { initServerServices } from '@app-builder/services/init.server';
import { badRequest } from '@app-builder/utils/http/http-responses';
import { parseIdParamSafe, parseQuerySafe } from '@app-builder/utils/input-validation';
import { getRoute } from '@app-builder/utils/routes';
import { fromUUIDtoSUUID } from '@app-builder/utils/short-uuid';
import { type LoaderFunctionArgs, redirect } from '@remix-run/node';
import { useLoaderData, useNavigate } from '@remix-run/react';
import { type Namespace } from 'i18next';
import qs from 'qs';
import { useCallback, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { omit } from 'remeda';
import { Button, Checkbox, Input } from 'ui-design-system';
import { Icon } from 'ui-icons';

import { MY_INBOX_ID } from './_index';

export const handle = {
  i18n: ['navigation', ...casesI18n] satisfies Namespace,
};

export const buildQueryParams = (
  filters: CasesFilters,
  offsetId: string | null,
  order: 'ASC' | 'DESC' | null,
) => {
  return {
    statuses: filters.statuses ?? [],
    name: filters.name,
    snoozed: filters.snoozed,
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

  const filtersForBackend: CaseFilters = {
    ...parsedQuery.data,
    ...parsedPaginationQuery.data,
    ...(inboxId && { inboxIds: [inboxId] }),
    statuses: parsedQuery.data.statuses as CaseStatus[] | undefined,
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

const SearchByName = ({
  initialValue,
  onClear,
  onChange,
}: {
  initialValue?: string;
  onChange: (value?: string) => void;
  onClear: () => void;
}) => {
  const { t } = useTranslation(['cases', 'common']);
  const [value, setValue] = useState(initialValue);

  return (
    <div className="flex gap-1">
      <Input
        type="search"
        aria-label={t('cases:search.placeholder')}
        placeholder={t('cases:search.placeholder')}
        value={value}
        onChange={(e) => {
          setValue(e.target.value);
          if (!e.target.value) onClear();
        }}
        startAdornment="search"
      />
      <Button onClick={() => onChange(value)} disabled={!value}>
        {t('common:search')}
      </Button>
    </div>
  );
};

const ToggleFilter = ({
  onCheckedChange,
  field,
  label,
  value,
}: {
  field: 'excludeAssigned' | 'includeSnoozed';
  label: string;
  value: boolean;
  onCheckedChange: (state: boolean) => void;
}) => {
  return (
    <div className="flex gap-2 p-2">
      <Checkbox
        id={field}
        defaultChecked={value}
        onCheckedChange={(state) => {
          if (state !== 'indeterminate') {
            onCheckedChange(state);
          }
        }}
      />
      <FormLabel name="field" className="font-medium">
        {label}
      </FormLabel>
    </div>
  );
};

export default function Cases() {
  const { t } = useTranslation(casesI18n);
  const {
    inboxId,
    casesData: initialCasesData,
    filters,
    pagination: initialPagination,
  } = useLoaderData<typeof loader>();

  const { data, next, previous, reset } = useCursorPaginatedFetcher<
    typeof loader,
    PaginatedResponse<Case>
  >({
    transform: (fetcherData) => fetcherData.casesData,
    initialData: initialCasesData,
    getQueryParams: (cursor) => buildQueryParams(filters, cursor, initialPagination.order ?? null),
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
        const search = qs.stringify(buildQueryParams(casesFilters, null, null), {
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
      if (pagination.order) {
        navigate(
          {
            pathname: getRoute('/cases/inboxes/:inboxId', {
              inboxId: inboxId ? fromUUIDtoSUUID(inboxId) : MY_INBOX_ID,
            }),
            search: qs.stringify(buildQueryParams(casesFilters, null, pagination.order), {
              addQueryPrefix: true,
              skipNulls: true,
            }),
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
                <div className="flex gap-4">
                  <SearchByName
                    initialValue={filters.name}
                    onClear={() => {
                      navigateCasesList({ ...filters, name: undefined });
                    }}
                    onChange={(value) => {
                      navigateCasesList({ ...filters, name: value });
                    }}
                  />
                  <ToggleFilter
                    field="includeSnoozed"
                    value={filters.snoozed ?? false}
                    label={t('cases:include_snoozed')}
                    onCheckedChange={(snoozed) => {
                      navigateCasesList({ ...filters, snoozed });
                    }}
                  />
                  <ToggleFilter
                    field="excludeAssigned"
                    value={filters.excludeAssigned ?? false}
                    label={t('cases:exclude_assigned')}
                    onCheckedChange={(excludeAssigned) => {
                      navigateCasesList({ ...filters, excludeAssigned });
                    }}
                  />
                </div>
                <div className="flex gap-4">
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
              </div>
              <CasesFiltersBar />
              <CasesList
                key={inboxId}
                cases={cases}
                className="max-h-[60dvh]"
                onSortingChange={(state) => {
                  const paginationParams: PaginationParams = {
                    ...omit(initialPagination, ['order']),
                    ...(state.length > 0 && {
                      order: state[0]?.desc ? 'DESC' : 'ASC',
                    }),
                  };

                  if (hasAlreadyOrdered) navigateCasesList(filters, paginationParams);
                  hasAlreadyOrdered = true;
                }}
              />
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
