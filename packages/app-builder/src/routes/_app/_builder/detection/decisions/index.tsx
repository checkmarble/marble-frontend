import {
  Callout,
  DecisionFilterPopover,
  DecisionFiltersBar,
  DecisionFiltersMenu,
  DecisionFiltersProvider,
  DecisionRightPanel,
  DecisionsList,
  DecisionViewModel,
  decisionsI18n,
  ErrorComponent,
  Page,
  useDecisionFiltersContext,
} from '@app-builder/components';
import {
  getDecisionFilters,
  toSubmittedDecisionFilters,
} from '@app-builder/components/Decisions/Filters/decision-filters';
import { decisionFilterNames } from '@app-builder/components/Decisions/Filters/filters';
import {
  CursorPaginationButtons,
  paginationSchema,
  usePaginationsButton,
} from '@app-builder/components/Decisions/PaginationButtons';
import { DetectionNavigationTabs } from '@app-builder/components/Detection';
import { FiltersButton, last30DaysDuration } from '@app-builder/components/Filters';
import { Spinner } from '@app-builder/components/Spinner';
import { useTanstackTableListSelection } from '@app-builder/hooks/useTanstackTableListSelection';
import { authMiddleware } from '@app-builder/middlewares/auth-middleware';
import { type Decision } from '@app-builder/models/decision';
import { RequestTimeoutError } from '@app-builder/models/http-errors';
import { type PaginationParams } from '@app-builder/models/pagination';
import { DecisionFilters, decisionFiltersSchema, isUnboundedDateRange } from '@app-builder/schemas/decisions';
import { handleSubmit } from '@app-builder/utils/form';
import { DateRangeFilter } from '@app-builder/utils/schema/filterSchema';
import { fromUUIDtoSUUID } from '@app-builder/utils/short-uuid';
import * as Sentry from '@sentry/react';
import { useForm } from '@tanstack/react-form';
import { Await, createFileRoute, redirect, useNavigate, useRouter } from '@tanstack/react-router';
import { createServerFn } from '@tanstack/react-start';
import { type MouseEvent, Suspense, useCallback, useEffect, useRef, useState } from 'react';
import toast from 'react-hot-toast';
import { useTranslation } from 'react-i18next';
import * as R from 'remeda';
import { Button, Panel, SearchInput } from 'ui-design-system';
import { Icon } from 'ui-icons';
import { z } from 'zod/v4';

const DEFAULT_DECISIONS_DATE_RANGE = {
  type: 'dynamic',
  fromNow: last30DaysDuration,
} as const satisfies DateRangeFilter;

const decisionsListQueryParamsSchema = z.intersection(decisionFiltersSchema, paginationSchema);
type DecisionsListQueryParams = z.infer<typeof decisionsListQueryParamsSchema>;

type DecisionsListResult = {
  decisionsData: { items: Decision[]; hasNextPage: boolean };
  listError: 'request_timeout' | undefined;
};

function hasOtherDecisionFilters(params: DecisionsListQueryParams) {
  const filters = getDecisionFilters(params);
  return (
    filters.outcomeAndReviewStatus !== undefined ||
    (filters.triggerObject?.length ?? 0) > 0 ||
    filters.triggerObjectId !== undefined ||
    filters.pivotValue !== undefined ||
    (filters.scenarioId?.length ?? 0) > 0 ||
    (filters.scheduledExecutionId?.length ?? 0) > 0 ||
    (filters.caseInboxId?.length ?? 0) > 0 ||
    filters.hasCase !== undefined
  );
}

export const buildQueryParams = (
  filters: DecisionFilters,
  paginationParams?: PaginationParams,
): DecisionsListQueryParams => {
  return {
    ...getDecisionFilters(filters),
    offsetId: paginationParams?.offsetId,
    next: paginationParams?.next,
    previous: paginationParams?.previous,
    order: paginationParams?.order,
    sorting: paginationParams?.sorting,
    limit: paginationParams?.limit,
  };
};

const decisionsPageLoader = createServerFn({ method: 'GET' })
  .middleware([authMiddleware])
  .validator(decisionsListQueryParamsSchema)
  .handler(async function decisionsPageLoader({ context, data }) {
    const { scenario, dataModelRepository, inbox } = context.authInfo;
    const [scenarios, pivots, inboxes] = await Promise.all([
      scenario.listScenarios(),
      dataModelRepository.listPivots({}),
      inbox.listInboxes(),
    ]);

    return {
      scenarios,
      filters: data,
      hasPivots: pivots.length > 0,
      inboxes,
    };
  });

const listDecisionsLoader = createServerFn({ method: 'GET' })
  .middleware([authMiddleware])
  .validator(decisionsListQueryParamsSchema)
  .handler(async function listDecisionsLoader({ context, data }) {
    const { decision } = context.authInfo;
    const { outcomeAndReviewStatus, dateRange, ...filters } = data;
    const listDateRange = isUnboundedDateRange(dateRange) ? undefined : dateRange;

    try {
      const decisionsData = await decision.listDecisions({
        outcome: outcomeAndReviewStatus?.outcome ? [outcomeAndReviewStatus.outcome] : [],
        reviewStatus: outcomeAndReviewStatus?.reviewStatus ? [outcomeAndReviewStatus.reviewStatus] : [],
        ...filters,
        dateRange: listDateRange,
      });
      return { decisionsData, listError: undefined };
    } catch (error) {
      if (error instanceof RequestTimeoutError) {
        return {
          decisionsData: { items: [] as Decision[], hasNextPage: false },
          listError: 'request_timeout' as const,
        };
      }
      throw error;
    }
  });

export const Route = createFileRoute('/_app/_builder/detection/decisions/')({
  validateSearch: decisionsListQueryParamsSchema,
  beforeLoad: ({ search }) => {
    if (search.dateRange || hasOtherDecisionFilters(search)) {
      return;
    }

    throw redirect({
      to: '/detection/decisions',
      search: {
        ...search,
        dateRange: DEFAULT_DECISIONS_DATE_RANGE,
      },
      replace: true,
    });
  },
  loaderDeps: ({ search }) => search,
  loader: ({ deps }) => {
    const decisionsPromise = listDecisionsLoader({ data: deps });
    return decisionsPageLoader({ data: deps }).then((page) => ({
      ...page,
      decisionsPromise,
    }));
  },
  errorComponent: ({ error }) => {
    Sentry.captureException(error);
    return <ErrorComponent error={error} />;
  },
  component: DetectionDecisions,
});

function DetectionDecisions() {
  const { decisionsPromise, filters, scenarios, hasPivots, inboxes } = Route.useLoaderData();
  const decisionFilters = getDecisionFilters(filters);

  const navigate = useNavigate();
  const navigateDecisionList = useCallback(
    (decisionFilters: DecisionFilters, paginationParams?: PaginationParams) => {
      const searchPaginationParams: PaginationParams = {
        ...(filters.order ? { order: filters.order } : {}),
        ...(filters.sorting ? { sorting: filters.sorting } : {}),
        ...(filters.limit ? { limit: filters.limit } : {}),
        ...(paginationParams ?? {}),
      };

      navigate({
        to: '/detection/decisions',
        search: buildQueryParams(decisionFilters, searchPaginationParams),
        replace: true,
      });
    },
    [filters.limit, filters.order, filters.sorting, navigate],
  );

  const [decisionIdsToAdd, setDecisionIdsToAdd] = useState<string[]>([]);
  const getSelectedRowsRef = useRef<() => DecisionViewModel[]>(() => []);
  const [hasSelectedRows, setHasSelectedRows] = useState(false);
  const onSelectionChange = useCallback(
    (selection: { hasSelectedRows: boolean; getSelectedRows: () => DecisionViewModel[] }) => {
      getSelectedRowsRef.current = selection.getSelectedRows;
      setHasSelectedRows(selection.hasSelectedRows);
    },
    [],
  );

  return (
    <Panel.Root>
      <Page.Main>
        <Page.Content width="table">
          <DetectionNavigationTabs />
          <div className="flex flex-col gap-md">
            <DecisionFiltersProvider
              scenarios={scenarios}
              submitDecisionFilters={navigateDecisionList}
              filterValues={decisionFilters}
              hasPivots={hasPivots}
              inboxes={inboxes}
            >
              <div className="flex justify-between gap-md">
                <SearchById />
                <div className="flex gap-sm">
                  <DecisionFiltersMenu filterNames={decisionFilterNames}>
                    <FiltersButton />
                  </DecisionFiltersMenu>
                  <AddToCase
                    hasSelection={hasSelectedRows}
                    getSelectedDecisions={() => getSelectedRowsRef.current()}
                    onDecisionIdsChange={setDecisionIdsToAdd}
                  />
                </div>
              </div>
              <DecisionFiltersBar />
              <Suspense fallback={<DecisionsListSkeleton />}>
                <Await promise={decisionsPromise} fallback={<DecisionsListSkeleton />}>
                  {(result) =>
                    result.listError === 'request_timeout' ? (
                      <DecisionsTimeout currentSearch={filters} />
                    ) : (
                      <DecisionsLoaded
                        decisionsData={result.decisionsData}
                        decisionFilters={decisionFilters}
                        filters={filters}
                        navigateDecisionList={navigateDecisionList}
                        onSelectionChange={onSelectionChange}
                      />
                    )
                  }
                </Await>
              </Suspense>
            </DecisionFiltersProvider>
          </div>
        </Page.Content>
      </Page.Main>
      <DecisionRightPanel decisionIds={decisionIdsToAdd} />
    </Panel.Root>
  );
}

interface DecisionsTimeoutProps {
  currentSearch: DecisionsListQueryParams;
}

function DecisionsTimeout({ currentSearch }: DecisionsTimeoutProps) {
  const { t } = useTranslation(['common', ...decisionsI18n]);

  return (
    <Callout variant="outlined" color="red" icon="error" iconColor="red">
      <div className="flex flex-wrap gap-md items-center">
        <span className="text-red-primary">{t('decisions:errors.request_timeout')}</span>
        <DecisionFilterPopover filterName="dateRange" />
        <DecisionListRetryButton currentSearch={currentSearch} />
      </div>
    </Callout>
  );
}

interface DecisionsLoadedProps {
  decisionsData: DecisionsListResult['decisionsData'];
  decisionFilters: DecisionFilters;
  filters: DecisionsListQueryParams;
  navigateDecisionList: (decisionFilters: DecisionFilters, paginationParams?: PaginationParams) => void;
  onSelectionChange: (selection: { hasSelectedRows: boolean; getSelectedRows: () => DecisionViewModel[] }) => void;
}

function DecisionsLoaded({
  decisionsData,
  decisionFilters,
  filters,
  navigateDecisionList,
  onSelectionChange,
}: DecisionsLoadedProps) {
  const { items: decisions, ...pagination } = decisionsData;
  const paginationState = usePaginationsButton({
    filterValues: decisionFilters,
    items: decisions,
    initialOffsetId: filters.offsetId,
  });
  const { hasSelectedRows, getSelectedRows, selectionProps, tableProps } =
    useTanstackTableListSelection<DecisionViewModel>(decisions, (row) => row.id);

  useEffect(() => {
    onSelectionChange({ hasSelectedRows, getSelectedRows });
    return () => onSelectionChange({ hasSelectedRows: false, getSelectedRows: () => [] });
  }, [getSelectedRows, hasSelectedRows, onSelectionChange]);

  return (
    <>
      <DecisionsList
        className="max-h-[60dvh]"
        decisions={decisions}
        selectable
        selectionProps={selectionProps}
        tableProps={tableProps}
        columnVisibility={{
          pivot_value: false,
        }}
      />
      <CursorPaginationButtons
        items={decisions}
        onPaginationChange={(paginationParams: PaginationParams) =>
          navigateDecisionList(decisionFilters, paginationParams)
        }
        paginationState={paginationState}
        boundariesDisplay="dates"
        {...pagination}
      />
    </>
  );
}

function DecisionsListSkeleton() {
  return (
    <div className="border border-grey-border rounded-md max-h-[60dvh]">
      <div className="h-13 border-b border-grey-border" />
      <div className="h-30 bg-grey-background animate-pulse flex items-center justify-center">
        <Spinner className="size-12" />
      </div>
    </div>
  );
}

interface DecisionListRetryButtonProps {
  currentSearch: DecisionsListQueryParams;
}

function DecisionListRetryButton({ currentSearch }: DecisionListRetryButtonProps) {
  const { t } = useTranslation(['common']);
  const { form } = useDecisionFiltersContext();
  const navigate = useNavigate();
  const router = useRouter();

  return (
    <Button
      variant="secondary"
      onClick={() => {
        const nextFilters = toSubmittedDecisionFilters(form.state.values);
        const currentFilters = getDecisionFilters(currentSearch);

        if (R.isDeepEqual(nextFilters, currentFilters)) {
          void router.invalidate();
          return;
        }

        const searchPaginationParams: PaginationParams = {
          ...(currentSearch.order ? { order: currentSearch.order } : {}),
          ...(currentSearch.sorting ? { sorting: currentSearch.sorting } : {}),
          ...(currentSearch.limit ? { limit: currentSearch.limit } : {}),
        };

        void navigate({
          to: '/detection/decisions',
          search: buildQueryParams(nextFilters, searchPaginationParams),
          replace: true,
        });
      }}
    >
      {t('common:retry')}
    </Button>
  );
}

function AddToCase({
  hasSelection,
  getSelectedDecisions,
  onDecisionIdsChange,
}: {
  hasSelection: boolean;
  getSelectedDecisions: () => { id: string; case?: object }[];
  onDecisionIdsChange: (decisionIds: string[]) => void;
}) {
  const { t } = useTranslation(['common', 'navigation', ...decisionsI18n]);
  const getDecisionIds = (event: MouseEvent<HTMLButtonElement>) => {
    const selectedDecisions = getSelectedDecisions();
    if (selectedDecisions.some((decision) => decision.case)) {
      event.preventDefault();
      toast.error(t('decisions:errors.decision_already_in_case'));
    } else {
      onDecisionIdsChange(selectedDecisions.map(({ id }) => id));
    }
  };

  return (
    <Panel.Trigger asChild onClick={getDecisionIds}>
      <Button size="medium" disabled={!hasSelection}>
        <Icon icon="plus" className="size-5" />
        {t('decisions:add_to_case')}
      </Button>
    </Panel.Trigger>
  );
}

const decisionIdToParams = (decisionId: string) => {
  try {
    return fromUUIDtoSUUID(decisionId ?? '');
  } catch {
    return decisionId;
  }
};

const searchFormSchema = z.object({
  decisionId: z.string().nonempty(),
});

function SearchById() {
  const { t } = useTranslation(['common', 'navigation', ...decisionsI18n]);
  const navigate = useNavigate();
  const form = useForm({
    defaultValues: {
      decisionId: '',
    },
    validators: {
      onSubmit: searchFormSchema,
      onMount: searchFormSchema,
    },
    onSubmit: ({ formApi, value }) => {
      if (formApi.state.isValid) {
        const decisionId = decisionIdToParams(value.decisionId);
        navigate({ to: '/detection/decisions/$decisionId', params: { decisionId } });
      }
    },
  });

  return (
    <form className="flex gap-xs" onSubmit={handleSubmit(form)}>
      <form.Field name="decisionId">
        {(field) => (
          <SearchInput
            size="medium"
            aria-label={t('decisions:search.placeholder')}
            placeholder={t('decisions:search.placeholder')}
            value={field.state.value}
            onChange={(value) => field.handleChange(value)}
          />
        )}
      </form.Field>
      <form.Subscribe selector={(store) => [store.canSubmit]}>
        {([canSubmit]) => (
          <Button size="medium" type="submit" disabled={!canSubmit}>
            {t('common:search')}
          </Button>
        )}
      </form.Subscribe>
    </form>
  );
}
