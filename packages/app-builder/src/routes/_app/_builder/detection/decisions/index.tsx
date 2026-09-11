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
} from '@app-builder/components';
import { decisionFilterNames } from '@app-builder/components/Decisions/Filters/filters';
import {
  CursorPaginationButtons,
  paginationSchema,
  usePaginationsButton,
} from '@app-builder/components/Decisions/PaginationButtons';
import { DetectionNavigationTabs } from '@app-builder/components/Detection';
import { FiltersButton, last30DaysDuration } from '@app-builder/components/Filters';
import { useLoaderRevalidator } from '@app-builder/contexts/LoaderRevalidatorContext';
import { useTanstackTableListSelection } from '@app-builder/hooks/useTanstackTableListSelection';
import { authMiddleware } from '@app-builder/middlewares/auth-middleware';
import { type Decision } from '@app-builder/models/decision';
import { RequestTimeoutError } from '@app-builder/models/http-errors';
import { type PaginationParams } from '@app-builder/models/pagination';
import { DecisionFilters, decisionFiltersSchema } from '@app-builder/schemas/decisions';
import { handleSubmit } from '@app-builder/utils/form';
import { DateRangeFilter } from '@app-builder/utils/schema/filterSchema';
import { fromUUIDtoSUUID } from '@app-builder/utils/short-uuid';
import * as Sentry from '@sentry/react';
import { useForm } from '@tanstack/react-form';
import { createFileRoute, useNavigate } from '@tanstack/react-router';
import { createServerFn } from '@tanstack/react-start';
import { type MouseEvent, useCallback, useState } from 'react';
import toast from 'react-hot-toast';
import { useTranslation } from 'react-i18next';
import { Button, Panel, SearchInput } from 'ui-design-system';
import { Icon } from 'ui-icons';
import { z } from 'zod/v4';

const DEFAULT_DECISIONS_DATE_RANGE = {
  type: 'dynamic',
  fromNow: last30DaysDuration,
} as const satisfies DateRangeFilter;

const decisionsListQueryParamsSchema = z.intersection(decisionFiltersSchema, paginationSchema);
type DecisionsListQueryParams = z.infer<typeof decisionsListQueryParamsSchema>;

function getDecisionFilters(filters: DecisionsListQueryParams): DecisionFilters {
  return {
    outcomeAndReviewStatus: filters.outcomeAndReviewStatus,
    triggerObject: filters.triggerObject,
    triggerObjectId: filters.triggerObjectId,
    dateRange: filters.dateRange,
    pivotValue: filters.pivotValue,
    scenarioId: filters.scenarioId,
    scheduledExecutionId: filters.scheduledExecutionId,
    caseInboxId: filters.caseInboxId,
    hasCase: filters.hasCase,
  };
}

function withDefaultDecisionDateRange(params: DecisionsListQueryParams): DecisionsListQueryParams {
  if (params.dateRange) {
    return params;
  }

  const filters = getDecisionFilters(params);
  const hasOtherFilters =
    filters.outcomeAndReviewStatus !== undefined ||
    (filters.triggerObject?.length ?? 0) > 0 ||
    filters.triggerObjectId !== undefined ||
    filters.pivotValue !== undefined ||
    (filters.scenarioId?.length ?? 0) > 0 ||
    (filters.scheduledExecutionId?.length ?? 0) > 0 ||
    (filters.caseInboxId?.length ?? 0) > 0 ||
    filters.hasCase !== undefined;

  if (hasOtherFilters) {
    return params;
  }

  return { ...params, dateRange: DEFAULT_DECISIONS_DATE_RANGE };
}

const decisionsListSearchSchema = decisionsListQueryParamsSchema.transform(withDefaultDecisionDateRange);

export const buildQueryParams = (
  filters: DecisionFilters,
  paginationParams?: PaginationParams,
): DecisionsListQueryParams => {
  return {
    outcomeAndReviewStatus: filters.outcomeAndReviewStatus,
    triggerObject: filters.triggerObject,
    triggerObjectId: filters.triggerObjectId,
    dateRange: filters.dateRange
      ? filters.dateRange.type === 'static'
        ? {
            type: 'static',
            endDate: filters.dateRange.endDate,
            startDate: filters.dateRange.startDate,
          }
        : {
            type: 'dynamic',
            fromNow: filters.dateRange.fromNow,
          }
      : undefined,
    pivotValue: filters.pivotValue,
    scenarioId: filters.scenarioId,
    scheduledExecutionId: filters.scheduledExecutionId,
    caseInboxId: filters.caseInboxId,
    hasCase: filters?.hasCase,
    offsetId: paginationParams?.offsetId,
    next: paginationParams?.next,
    previous: paginationParams?.previous,
    order: paginationParams?.order,
    sorting: paginationParams?.sorting,
    limit: paginationParams?.limit,
  };
};

const decisionsLoader = createServerFn({ method: 'GET' })
  .middleware([authMiddleware])
  .validator(decisionsListSearchSchema)
  .handler(async function decisionsLoader({ context, data }) {
    const { decision, scenario, dataModelRepository, inbox } = context.authInfo;

    const { outcomeAndReviewStatus, ...filters } = data;
    const [decisionsResult, scenarios, pivots, inboxes] = await Promise.all([
      decision
        .listDecisions({
          outcome: outcomeAndReviewStatus?.outcome ? [outcomeAndReviewStatus.outcome] : [],
          reviewStatus: outcomeAndReviewStatus?.reviewStatus ? [outcomeAndReviewStatus.reviewStatus] : [],
          ...filters,
        })
        .then((decisionsData) => ({ decisionsData, listError: undefined }))
        .catch((error) => {
          if (error instanceof RequestTimeoutError) {
            return {
              decisionsData: { items: [] as Decision[], hasNextPage: false },
              listError: 'request_timeout' as const,
            };
          }
          throw error;
        }),
      scenario.listScenarios(),
      dataModelRepository.listPivots({}),
      inbox.listInboxes(),
    ]);

    return {
      ...decisionsResult,
      scenarios,
      filters: data,
      hasPivots: pivots.length > 0,
      inboxes,
    };
  });

export const Route = createFileRoute('/_app/_builder/detection/decisions/')({
  validateSearch: decisionsListSearchSchema,
  loaderDeps: ({ search }) => search,
  loader: ({ deps }) => decisionsLoader({ data: deps }),
  errorComponent: ({ error }) => {
    Sentry.captureException(error);
    return <ErrorComponent error={error} />;
  },
  component: DetectionDecisions,
});

function DetectionDecisions() {
  const { t } = useTranslation(['common', ...decisionsI18n]);
  const revalidate = useLoaderRevalidator();
  const { decisionsData, filters, scenarios, hasPivots, inboxes, listError } = Route.useLoaderData();
  const { items: decisions, ...pagination } = decisionsData;
  const decisionFilters = getDecisionFilters(filters);
  const paginationState = usePaginationsButton({
    filterValues: decisionFilters,
    items: decisions,
    initialOffsetId: filters.offsetId,
  });

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

  const { hasSelectedRows, getSelectedRows, selectionProps, tableProps } =
    useTanstackTableListSelection<DecisionViewModel>(decisions, (row) => row.id);
  const [decisionIdsToAdd, setDecisionIdsToAdd] = useState<string[]>([]);

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
                    getSelectedDecisions={getSelectedRows}
                    onDecisionIdsChange={setDecisionIdsToAdd}
                  />
                </div>
              </div>
              <DecisionFiltersBar />
              {listError === 'request_timeout' ? (
                <Callout variant="outlined" color="red" icon="error" iconColor="red">
                  <div className="flex flex-wrap gap-md items-center">
                    <span className="text-red-primary">{t('decisions:errors.request_timeout')}</span>
                    <DecisionFilterPopover filterName="dateRange" />
                    <Button variant="secondary" onClick={() => revalidate()}>
                      {t('common:retry')}
                    </Button>
                  </div>
                </Callout>
              ) : (
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
              )}
            </DecisionFiltersProvider>
          </div>
        </Page.Content>
      </Page.Main>
      <DecisionRightPanel decisionIds={decisionIdsToAdd} />
    </Panel.Root>
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
