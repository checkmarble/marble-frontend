import {
  type DecisionFilters,
  DecisionFiltersMenu,
  DecisionFiltersProvider,
  decisionFiltersSchema,
  decisionsI18n,
  DecisionsList,
  ErrorComponent,
  Page,
} from '@app-builder/components';
import { DecisionFiltersBar } from '@app-builder/components/Decisions/Filters/DecisionFiltersBar';
import { decisionFilterNames } from '@app-builder/components/Decisions/Filters/filters';
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
import qs from 'qs';
import { useCallback, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Button, Input } from 'ui-design-system';
import { Decision, Filters, Search } from 'ui-icons';

export const handle = {
  i18n: ['common', 'navigation', ...decisionsI18n] satisfies Namespace,
};

export async function loader({ request }: LoaderArgs) {
  const { authService } = serverServices;
  const { decision, scenario } = await authService.isAuthenticated(request, {
    failureRedirect: '/login',
  });

  const parsedQuery = await parseQuerySafe(request, decisionFiltersSchema);
  if (!parsedQuery.success) {
    return redirect(getRoute('/decisions'));
  }
  const [decisions, scenarios] = await Promise.all([
    decision.listDecisions(parsedQuery.data),
    scenario.listScenarios(),
  ]);

  return json({
    decisions,
    scenarios,
    filters: parsedQuery.data,
  });
}

export default function Decisions() {
  const { t } = useTranslation(handle.i18n);
  const { decisions, filters, scenarios } = useLoaderData<typeof loader>();

  const navigate = useNavigate();
  const submitDecisionFilters = useCallback(
    (decisionFilters: DecisionFilters) => {
      navigate(
        {
          pathname: getRoute('/decisions'),
          search: qs.stringify(
            {
              outcome: decisionFilters.outcome ?? [],
              triggerObject: decisionFilters.triggerObject ?? [],
              dateRange: decisionFilters.dateRange
                ? {
                    endDate: decisionFilters.dateRange.endDate || null,
                    startDate: decisionFilters.dateRange.startDate || null,
                  }
                : {},
              scenarioId: decisionFilters.scenarioId ?? [],
            },
            {
              addQueryPrefix: true,
              skipNulls: true,
            }
          ),
        },
        { replace: true }
      );
    },
    [navigate]
  );

  return (
    <Page.Container>
      <Page.Header>
        <Decision className="mr-2" height="24px" width="24px" />
        {t('navigation:decisions')}
      </Page.Header>

      <Page.Content>
        <div className="flex flex-col gap-4">
          <DecisionFiltersProvider
            scenarios={scenarios}
            submitDecisionFilters={submitDecisionFilters}
            filterValues={filters}
          >
            <div className="flex justify-between gap-4">
              <SearchById />
              <div className="flex gap-4">
                <DecisionFiltersMenu filterNames={decisionFilterNames}>
                  <Button className="flex flex-row gap-2" variant="secondary">
                    <Filters className="text-l" />
                    <span className="text-s font-semibold first-letter:capitalize">
                      {t('decisions:filters')}
                    </span>
                  </Button>
                </DecisionFiltersMenu>
                {/* <Button>Add to case</Button> */}
              </div>
            </div>
            <DecisionFiltersBar />
            <DecisionsList decisions={decisions} />
          </DecisionFiltersProvider>
        </div>
      </Page.Content>
    </Page.Container>
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
        startAdornment={<Search />}
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
