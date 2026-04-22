import {
  DecisionFiltersBar,
  DecisionFiltersMenu,
  DecisionFiltersProvider,
  DecisionRightPanel,
  DecisionsList,
  DecisionViewModel,
  decisionsI18n,
  ErrorComponent,
  Page,
  useDecisionRightPanelContext,
} from '@app-builder/components';
import { AddToCaseForm } from '@app-builder/components/Decisions/AddToCaseForm';
import { decisionFilterNames } from '@app-builder/components/Decisions/Filters/filters';
import {
  CursorPaginationButtons,
  paginationSchema,
  usePaginationsButton,
} from '@app-builder/components/Decisions/PaginationButtons';
import { DetectionNavigationTabs } from '@app-builder/components/Detection';
import { FiltersButton } from '@app-builder/components/Filters';
import { useTanstackTableListSelection } from '@app-builder/hooks/useTanstackTableListSelection';
import { authMiddleware } from '@app-builder/middlewares/auth-middleware';
import { type PaginationParams } from '@app-builder/models/pagination';
import { DecisionFilters, decisionFiltersSchema } from '@app-builder/schemas/decisions';
import { handleSubmit } from '@app-builder/utils/form';
import { fromUUIDtoSUUID } from '@app-builder/utils/short-uuid';
import * as Sentry from '@sentry/react';
import { useForm } from '@tanstack/react-form';
import { createFileRoute, useNavigate } from '@tanstack/react-router';
import { createServerFn } from '@tanstack/react-start';
import { useCallback } from 'react';
import toast from 'react-hot-toast';
import { useTranslation } from 'react-i18next';
import { Button, Input } from 'ui-design-system';
import { Icon } from 'ui-icons';
import { z } from 'zod/v4';

const decisionsListQueryParamsSchema = z.intersection(decisionFiltersSchema, paginationSchema);
type DecisionsListQueryParams = z.infer<typeof decisionsListQueryParamsSchema>;

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

const decisionsLoader = createServerFn({ method: 'GET' })
  .middleware([authMiddleware])
  .inputValidator(decisionsListQueryParamsSchema)
  .handler(async function decisionsLoader({ context, data }) {
    const { decision, scenario, dataModelRepository, inbox } = context.authInfo;

    const { outcomeAndReviewStatus, ...filters } = data;
    const [decisionsData, scenarios, pivots, inboxes] = await Promise.all([
      decision.listDecisions({
        outcome: outcomeAndReviewStatus?.outcome ? [outcomeAndReviewStatus.outcome] : [],
        reviewStatus: outcomeAndReviewStatus?.reviewStatus ? [outcomeAndReviewStatus.reviewStatus] : [],
        ...filters,
      }),
      scenario.listScenarios(),
      dataModelRepository.listPivots({}),
      inbox.listInboxes(),
    ]);

    return {
      decisionsData,
      scenarios,
      filters: data,
      hasPivots: pivots.length > 0,
      inboxes,
    };
  });

export const Route = createFileRoute('/_app/_builder/detection/decisions/')({
  validateSearch: decisionsListQueryParamsSchema,
  loaderDeps: ({ search }) => search,
  loader: ({ deps }) => decisionsLoader({ data: deps }),
  errorComponent: ({ error }) => {
    Sentry.captureException(error);
    return <ErrorComponent error={error} />;
  },
  component: DetectionDecisions,
});

function DetectionDecisions() {
  const { decisionsData, filters, scenarios, hasPivots, inboxes } = Route.useLoaderData();
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

  return (
    <DecisionRightPanel.Root content={<AddToCaseForm />}>
      <Page.Main>
        <Page.Container>
          <Page.ContentV2 className="gap-v2-md">
            <DetectionNavigationTabs />
            <div className="flex flex-col gap-4">
              <DecisionFiltersProvider
                scenarios={scenarios}
                submitDecisionFilters={navigateDecisionList}
                filterValues={decisionFilters}
                hasPivots={hasPivots}
                inboxes={inboxes}
              >
                <div className="flex justify-between gap-4">
                  <SearchById />
                  <div className="flex gap-4">
                    <DecisionFiltersMenu filterNames={decisionFilterNames}>
                      <FiltersButton />
                    </DecisionFiltersMenu>
                    <AddToCase hasSelection={hasSelectedRows} getSelectedDecisions={getSelectedRows} />
                  </div>
                </div>
                <DecisionFiltersBar />
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
              </DecisionFiltersProvider>
            </div>
          </Page.ContentV2>
        </Page.Container>
      </Page.Main>
    </DecisionRightPanel.Root>
  );
}

function AddToCase({
  hasSelection,
  getSelectedDecisions,
}: {
  hasSelection: boolean;
  getSelectedDecisions: () => { id: string; case?: object }[];
}) {
  const { t } = useTranslation(['common', 'navigation', ...decisionsI18n]);
  const { onTriggerClick } = useDecisionRightPanelContext();
  const getDecisionIds = () => {
    const selectedDecisions = getSelectedDecisions();
    if (selectedDecisions.some((decision) => decision.case)) {
      toast.error(t('decisions:errors.decision_already_in_case'));
    } else {
      onTriggerClick({ decisionIds: selectedDecisions.map(({ id }) => id) });
    }
  };

  return (
    <DecisionRightPanel.Trigger asChild onClick={getDecisionIds}>
      <Button disabled={!hasSelection}>
        <Icon icon="plus" className="size-5" />
        {t('decisions:add_to_case')}
      </Button>
    </DecisionRightPanel.Trigger>
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
    <form className="flex gap-1" onSubmit={handleSubmit(form)}>
      <form.Field name="decisionId">
        {(field) => (
          <Input
            type="search"
            aria-label={t('decisions:search.placeholder')}
            placeholder={t('decisions:search.placeholder')}
            value={field.state.value}
            onChange={(e) => field.handleChange(e.target.value)}
            startAdornment="search"
          />
        )}
      </form.Field>
      <form.Subscribe selector={(store) => [store.canSubmit]}>
        {([canSubmit]) => (
          <Button type="submit" disabled={!canSubmit}>
            {t('common:search')}
          </Button>
        )}
      </form.Subscribe>
    </form>
  );
}
