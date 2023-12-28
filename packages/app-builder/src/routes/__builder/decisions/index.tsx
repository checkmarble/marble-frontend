import {
  DecisionFiltersBar,
  DecisionFiltersMenu,
  DecisionFiltersProvider,
  decisionFiltersSchema,
  DecisionRightPanel,
  decisionsI18n,
  DecisionsList,
  ErrorComponent,
  Page,
  PaginationButtons,
  paginationSchema,
  useDecisionRightPanelContext,
  useSelectedDecisionIds,
} from '@app-builder/components';
import { decisionFilterNames } from '@app-builder/components/Decisions/Filters/filters';
import { FiltersButton } from '@app-builder/components/Filters';
import { type PaginationParams } from '@app-builder/models/pagination';
import { type DecisionFiltersWithPagination } from '@app-builder/repositories/DecisionRepository';
import { serverServices } from '@app-builder/services/init.server';
import { parseQuerySafe } from '@app-builder/utils/input-validation';
import { getRoute } from '@app-builder/utils/routes';
import { fromUUID } from '@app-builder/utils/short-uuid';
import { json, type LoaderArgs, redirect } from '@remix-run/node';
import {
  Form,
  useLoaderData,
  useNavigate,
  useRouteError,
} from '@remix-run/react';
import { captureRemixErrorBoundaryError } from '@sentry/remix';
import { type Namespace } from 'i18next';
import { type DecisionDetail } from 'marble-api';
import qs from 'qs';
import { useCallback, useState } from 'react';
import toast from 'react-hot-toast';
import { useTranslation } from 'react-i18next';
import { Button, Input } from 'ui-design-system';
import { Icon } from 'ui-icons';

export const handle = {
  i18n: ['common', 'navigation', ...decisionsI18n] satisfies Namespace,
};

export async function loader({ request }: LoaderArgs) {
  const { authService } = serverServices;
  const { decision, scenario } = await authService.isAuthenticated(request, {
    failureRedirect: '/login',
  });

  const parsedFilterQuery = await parseQuerySafe(
    request,
    decisionFiltersSchema,
  );
  const parsedPaginationQuery = await parseQuerySafe(request, paginationSchema);

  if (!parsedFilterQuery.success || !parsedPaginationQuery.success) {
    return redirect(getRoute('/decisions'));
  }

  const [decisionsData, scenarios] = await Promise.all([
    decision.listDecisions({
      ...parsedFilterQuery.data,
      ...parsedPaginationQuery.data,
    }),
    scenario.listScenarios(),
  ]);

  return json({
    decisionsData,
    scenarios,
    filters: parsedFilterQuery.data,
  });
}

export default function Decisions() {
  const { t } = useTranslation(handle.i18n);
  const {
    decisionsData: { items: decisions, ...pagination },
    filters,
    scenarios,
  } = useLoaderData<typeof loader>();

  const navigate = useNavigate();
  const navigateDecisionList = useCallback(
    (
      decisionFilters: DecisionFiltersWithPagination,
      pagination?: PaginationParams,
    ) => {
      navigate(
        {
          pathname: getRoute('/decisions'),
          search: qs.stringify(
            {
              outcome: decisionFilters.outcome ?? [],
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
              scenarioId: decisionFilters.scenarioId ?? [],
              offsetId: pagination?.offsetId || null,
              next: pagination?.next || null,
              previous: pagination?.previous || null,
            },
            {
              addQueryPrefix: true,
              skipNulls: true,
            },
          ),
        },
        { replace: true },
      );
    },
    [navigate],
  );

  const { hasSelection, getSelectedDecisions, selectionProps } =
    useSelectedDecisionIds();

  return (
    <DecisionRightPanel.Root>
      <Page.Container>
        <Page.Header>
          <Icon icon="decision" className="mr-2 h-6 w-6" />
          {t('navigation:decisions')}
        </Page.Header>

        <Page.Content>
          <div className="flex flex-col gap-4">
            <DecisionFiltersProvider
              scenarios={scenarios}
              submitDecisionFilters={navigateDecisionList}
              filterValues={filters}
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
                decisions={decisions}
                selectable
                selectionProps={selectionProps}
              />
              <PaginationButtons
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
    </DecisionRightPanel.Root>
  );
}

function AddToCase({
  hasSelection,
  getSelectedDecisions,
}: {
  hasSelection: boolean;
  getSelectedDecisions: () => DecisionDetail[];
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
        <Icon icon="plus" className="h-5 w-5" />
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
