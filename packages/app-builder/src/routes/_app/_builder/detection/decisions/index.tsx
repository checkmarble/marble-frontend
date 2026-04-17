import {
  CursorPaginationButtons,
  type DecisionFilters,
  DecisionFiltersBar,
  DecisionFiltersMenu,
  DecisionFiltersProvider,
  DecisionRightPanel,
  DecisionsList,
  DecisionViewModel,
  decisionFiltersSchema,
  decisionsI18n,
  ErrorComponent,
  Page,
  paginationSchema,
  useDecisionRightPanelContext,
} from '@app-builder/components';
import { AddToCaseForm } from '@app-builder/components/Decisions/AddToCaseForm';
import { decisionFilterNames } from '@app-builder/components/Decisions/Filters/filters';
import { DetectionNavigationTabs } from '@app-builder/components/Detection';
import { FiltersButton } from '@app-builder/components/Filters';
import { useAgnosticNavigation } from '@app-builder/contexts/AgnosticNavigationContext';
import { useTanstackTableListSelection } from '@app-builder/hooks/useTanstackTableListSelection';
import { authMiddleware } from '@app-builder/middlewares/auth-middleware';
import { type Decision } from '@app-builder/models/decision';
import { type PaginatedResponse, type PaginationParams } from '@app-builder/models/pagination';
import { handleSubmit } from '@app-builder/utils/form';
import { parseQuerySafe } from '@app-builder/utils/input-validation';
import { fromUUIDtoSUUID } from '@app-builder/utils/short-uuid';
import * as Sentry from '@sentry/react';
import { useForm } from '@tanstack/react-form';
import { createFileRoute, redirect, useNavigate } from '@tanstack/react-router';
import { createServerFn } from '@tanstack/react-start';
import { getRequest } from '@tanstack/react-start/server';
import qs from 'qs';
import { useCallback, useState } from 'react';
import toast from 'react-hot-toast';
import { useTranslation } from 'react-i18next';
import { Button, Input } from 'ui-design-system';
import { Icon } from 'ui-icons';
import { z } from 'zod/v4';

export const buildQueryParams = (filters: DecisionFilters, offsetId: string | null) => {
  return {
    outcomeAndReviewStatus: filters.outcomeAndReviewStatus ?? [],
    triggerObject: filters.triggerObject ?? [],
    triggerObjectId: filters.triggerObjectId || null,
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
    pivotValue: filters.pivotValue || null,
    scenarioId: filters.scenarioId ?? [],
    scheduledExecutionId: filters.scheduledExecutionId ?? [],
    caseInboxId: filters.caseInboxId ?? [],
    hasCase: filters?.hasCase ?? null,
    offsetId,
  };
};

const decisionsLoader = createServerFn()
  .middleware([authMiddleware])
  .handler(async function decisionsLoader({ context }) {
    const request = getRequest();
    const { decision, scenario, dataModelRepository, inbox } = context.authInfo;

    const parsedFilterQuery = await parseQuerySafe(request, decisionFiltersSchema);
    const parsedPaginationQuery = await parseQuerySafe(request, paginationSchema);

    if (!parsedFilterQuery.success || !parsedPaginationQuery.success) {
      throw redirect({ to: '/detection/decisions' });
    }

    const { outcomeAndReviewStatus, ...filters } = parsedFilterQuery.data;
    const [decisionsData, scenarios, pivots, inboxes] = await Promise.all([
      decision.listDecisions({
        outcome: outcomeAndReviewStatus?.outcome ? [outcomeAndReviewStatus.outcome] : [],
        reviewStatus: outcomeAndReviewStatus?.reviewStatus ? [outcomeAndReviewStatus.reviewStatus] : [],
        ...filters,
        ...parsedPaginationQuery.data,
      }),
      scenario.listScenarios(),
      dataModelRepository.listPivots({}),
      inbox.listInboxes(),
    ]);

    return {
      decisionsData,
      scenarios,
      filters: parsedFilterQuery.data,
      hasPivots: pivots.length > 0,
      inboxes,
    };
  });

export const Route = createFileRoute('/_app/_builder/detection/decisions/')({
  loader: () => decisionsLoader(),
  errorComponent: ({ error }) => {
    Sentry.captureException(error);
    return <ErrorComponent error={error} />;
  },
  component: DetectionDecisions,
});

function DetectionDecisions() {
  const { decisionsData: initialDecisionsData, filters, scenarios, hasPivots, inboxes } = Route.useLoaderData();

  const [currentPage, setCurrentPage] = useState<{ data: PaginatedResponse<Decision>; cursors: (string | null)[] }>({
    data: initialDecisionsData,
    cursors: [null],
  });
  const [pageNb, setPageNb] = useState(1);
  const [hasPreviousPage, setHasPreviousPage] = useState(false);

  const data = currentPage.data;
  const { items: decisions, ...pagination } = data;

  const navigate = useAgnosticNavigation();
  const navigateDecisionList = useCallback(
    (decisionFilters: DecisionFilters, paginationParams?: PaginationParams) => {
      if (!paginationParams) {
        setCurrentPage({ data: initialDecisionsData, cursors: [null] });
        setPageNb(1);
        setHasPreviousPage(false);
        navigate(
          {
            pathname: '/detection/decisions',
            search: qs.stringify(buildQueryParams(decisionFilters, null), {
              skipNulls: true,
              addQueryPrefix: true,
            }),
          },
          { replace: true },
        );
        return;
      }

      if (paginationParams.next && paginationParams.offsetId) {
        // Load next page
        setPageNb((p) => p + 1);
        setHasPreviousPage(true);
      }
      if (paginationParams.previous) {
        setPageNb((p) => Math.max(1, p - 1));
        setHasPreviousPage(pageNb > 2);
      }
    },
    [navigate, initialDecisionsData, pageNb],
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
                filterValues={filters}
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
                    navigateDecisionList(filters, paginationParams)
                  }
                  hasPreviousPage={hasPreviousPage}
                  pageNb={pageNb}
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
