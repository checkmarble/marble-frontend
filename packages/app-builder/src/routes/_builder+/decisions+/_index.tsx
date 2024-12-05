import {
  CursorPaginationButtons,
  type DecisionFilters,
  DecisionFiltersBar,
  DecisionFiltersMenu,
  DecisionFiltersProvider,
  decisionFiltersSchema,
  DecisionRightPanel,
  decisionsI18n,
  DecisionsList,
  ErrorComponent,
  Page,
  paginationSchema,
  useDecisionRightPanelContext,
  useSelectedDecisionIds,
} from '@app-builder/components';
import { decisionFilterNames } from '@app-builder/components/Decisions/Filters/filters';
import { FiltersButton } from '@app-builder/components/Filters';
import { useCursorPagination } from '@app-builder/hooks/useCursorPagination';
import { type PaginationParams } from '@app-builder/models/pagination';
import { serverServices } from '@app-builder/services/init.server';
import { parseQuerySafe } from '@app-builder/utils/input-validation';
import { getRoute } from '@app-builder/utils/routes';
import { fromUUID } from '@app-builder/utils/short-uuid';
import { json, type LoaderFunctionArgs, redirect } from '@remix-run/node';
import {
  Form,
  useFetcher,
  useLoaderData,
  useNavigate,
  useRouteError,
} from '@remix-run/react';
import { captureRemixErrorBoundaryError } from '@sentry/remix';
import { type Namespace } from 'i18next';
import qs from 'qs';
import { useCallback, useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { useTranslation } from 'react-i18next';
import { Button, Input } from 'ui-design-system';
import { Icon } from 'ui-icons';

export const handle = {
  i18n: ['common', 'navigation', ...decisionsI18n] satisfies Namespace,
};

export async function loader({ request }: LoaderFunctionArgs) {
  const { authService } = serverServices;
  const { decision, scenario, dataModelRepository, inbox } =
    await authService.isAuthenticated(request, {
      failureRedirect: getRoute('/sign-in'),
    });

  const parsedFilterQuery = await parseQuerySafe(
    request,
    decisionFiltersSchema,
  );
  const parsedPaginationQuery = await parseQuerySafe(request, paginationSchema);

  if (!parsedFilterQuery.success || !parsedPaginationQuery.success) {
    return redirect(getRoute('/decisions/'));
  }

  const { outcomeAndReviewStatus, ...filters } = parsedFilterQuery.data;
  const [decisionsData, scenarios, pivots, inboxes] = await Promise.all([
    decision.listDecisions({
      outcome: outcomeAndReviewStatus?.outcome
        ? [outcomeAndReviewStatus.outcome]
        : [],
      reviewStatus: outcomeAndReviewStatus?.reviewStatus
        ? [outcomeAndReviewStatus.reviewStatus]
        : [],
      ...filters,
      ...parsedPaginationQuery.data,
    }),
    scenario.listScenarios(),
    dataModelRepository.listPivots({}),
    inbox.listInboxes(),
  ]);

  return json({
    decisionsData,
    scenarios,
    filters: parsedFilterQuery.data,
    hasPivots: pivots.length > 0,
    inboxes,
  });
}

export default function Decisions() {
  const { t } = useTranslation(handle.i18n);
  const {
    decisionsData: initialDecisionsData,
    filters: initialFilters,
    scenarios,
    hasPivots,
    inboxes,
  } = useLoaderData<typeof loader>();

  const [decisionsData, setDecisionsData] = useState(initialDecisionsData);
  const { items: decisions, ...pagination } = decisionsData;

  const [filters, setFilters] = useState(initialFilters);
  if (initialFilters !== filters) {
    setFilters(initialFilters);
    setDecisionsData(initialDecisionsData);
  }

  const {
    state: paginationState,
    next,
    previous,
    reset,
  } = useCursorPagination();

  const fetcher = useFetcher<typeof loader>();
  const navigate = useNavigate();

  useEffect(() => {
    if (paginationState.isPristine) {
      return;
    }

    fetcher.submit(
      qs.stringify(
        {
          outcomeAndReviewStatus: filters.outcomeAndReviewStatus ?? [],
          triggerObject: filters.triggerObject ?? [],
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
          ...(paginationState.cursor
            ? {
                offsetId: paginationState.cursor,
                next: true,
              }
            : {}),
        },
        { skipNulls: true },
      ),
      {
        method: 'GET',
      },
    );
  }, [paginationState, filters]);

  useEffect(() => {
    if (fetcher.data) {
      if (fetcher.data.decisionsData.items.length === 0) {
        // TODO: Manage no result
      } else {
        const { decisionsData: fetchedDecisionsData } = fetcher.data;
        setDecisionsData(fetchedDecisionsData);
      }
    }
  }, [fetcher.data, fetcher.state]);

  const navigateDecisionList = useCallback(
    (decisionFilters: DecisionFilters, pagination?: PaginationParams) => {
      if (!pagination) {
        reset();
        navigate(
          {
            pathname: getRoute('/decisions/'),
            search: qs.stringify(
              {
                outcomeAndReviewStatus:
                  decisionFilters.outcomeAndReviewStatus ?? [],
                triggerObject: decisionFilters.triggerObject ?? [],
                dateRange: decisionFilters.dateRange
                  ? decisionFilters.dateRange.type === 'static'
                    ? {
                        type: 'static',
                        endDate: decisionFilters.dateRange.endDate || null,
                        startDate: decisionFilters.dateRange.startDate || null,
                      }
                    : {
                        type: 'dynamic',
                        fromNow: decisionFilters.dateRange.fromNow,
                      }
                  : {},
                pivotValue: decisionFilters.pivotValue || null,
                scenarioId: decisionFilters.scenarioId ?? [],
                scheduledExecutionId:
                  decisionFilters.scheduledExecutionId ?? [],
                caseInboxId: decisionFilters.caseInboxId ?? [],
                hasCase: decisionFilters?.hasCase ?? null,
              },
              {
                addQueryPrefix: true,
                skipNulls: true,
              },
            ),
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
    [navigate, next, previous, reset],
  );

  const { hasSelection, getSelectedDecisions, selectionProps } =
    useSelectedDecisionIds();

  return (
    <DecisionRightPanel.Root>
      <Page.Main>
        <Page.Header>
          <Icon icon="decision" className="me-2 size-6" />
          {t('navigation:decisions')}
        </Page.Header>

        <Page.Container>
          <Page.Content>
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
                    <AddToCase
                      hasSelection={hasSelection}
                      getSelectedDecisions={getSelectedDecisions}
                    />
                  </div>
                </div>
                <DecisionFiltersBar />
                <DecisionsList
                  className="max-h-[60dvh]"
                  decisions={decisions}
                  selectable
                  selectionProps={selectionProps}
                  columnVisibility={{
                    pivot_value: false,
                  }}
                />
                <CursorPaginationButtons
                  items={decisions}
                  onPaginationChange={(paginationParams: PaginationParams) =>
                    navigateDecisionList(filters, paginationParams)
                  }
                  {...pagination}
                />
              </DecisionFiltersProvider>
            </div>
          </Page.Content>
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
  const { t } = useTranslation(handle.i18n);
  const { onTriggerClick } = useDecisionRightPanelContext();
  const getDecisionIds = () => {
    const selectedDecisions = getSelectedDecisions();
    if (selectedDecisions.some((decision) => decision.case)) {
      toast.error(t('common:errors.add_to_case.invalid'));
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

const decisionIdToParams = (decisionId: string | null) => {
  try {
    return fromUUID(decisionId ?? '');
  } catch {
    return decisionId;
  }
};
function SearchById() {
  const { t } = useTranslation(handle.i18n);
  const [decisionId, setDecisionId] = useState<string | null>(null);

  return (
    <Form
      className="flex gap-1"
      method="GET"
      action={getRoute('/decisions/:decisionId', {
        decisionId: decisionIdToParams(decisionId) ?? '',
      })}
    >
      <Input
        type="search"
        aria-label={t('decisions:search.placeholder')}
        placeholder={t('decisions:search.placeholder')}
        value={decisionId ?? ''}
        onChange={(e) => setDecisionId(e.target.value)}
        startAdornment="search"
      />
      <Button type="submit" disabled={!decisionId}>
        {t('common:search')}
      </Button>
    </Form>
  );
}

// Temporary disabled
// function ToggleLiveUpdate() {
//   const id = useId();
//   const { t } = useTranslation(handle.i18n);
//   const revalidator = useRevalidator();
//   const [liveUpdate, setLiveUpdate] = useState(false);
//   const visibilityState = useVisibilityChange();

//   useEffect(() => {
//     if (!liveUpdate || visibilityState === 'hidden') return;

//     const interval = setInterval(() => {
//       revalidator.revalidate();
//     }, 5000);

//     return () => {
//       clearInterval(interval);
//     };
//   }, [liveUpdate, revalidator, visibilityState]);

//   return (
//     <div className="flex flex-row items-center gap-2">
//       <Checkbox
//         id={id}
//         onCheckedChange={(checked) => {
//           if (checked === 'indeterminate') return;
//           setLiveUpdate(checked);
//         }}
//       />
//       <Label htmlFor={id} className="text-s whitespace-nowrap">
//         {t('decisions:live_update')}
//       </Label>
//     </div>
//   );
// }

export function ErrorBoundary() {
  const error = useRouteError();
  captureRemixErrorBoundaryError(error);
  return <ErrorComponent error={error} />;
}
