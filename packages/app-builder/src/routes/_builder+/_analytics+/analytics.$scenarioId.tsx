import { ErrorComponent } from '@app-builder/components';
import { Decisions } from '@app-builder/components/Analytics/Decisions';
import { RulesHit } from '@app-builder/components/Analytics/RulesHit';
import { BreadCrumbLink, type BreadCrumbProps } from '@app-builder/components/Breadcrumbs';
import {
  type AnalyticsFiltersQuery,
  analyticsFiltersQuery,
  type DecisionOutcomesPerPeriod,
  FilterSource,
} from '@app-builder/models/analytics';
import { type Scenario } from '@app-builder/models/scenario';
import { useGetAnalytics } from '@app-builder/queries/analytics/get-analytics';
import { useGetAvailableFilters } from '@app-builder/queries/analytics/get-available-filters';
import { initServerServices } from '@app-builder/services/init.server';
import { formatDateTimeWithoutPresets, formatDuration } from '@app-builder/utils/format';
import { getRoute } from '@app-builder/utils/routes';
import { fromParams, fromUUIDtoSUUID, useParam } from '@app-builder/utils/short-uuid';
import type { LoaderFunctionArgs } from '@remix-run/node';
import { useLoaderData, useNavigate, useRouteError, useSearchParams } from '@remix-run/react';
import { captureRemixErrorBoundaryError } from '@sentry/remix';
import { type Namespace } from 'i18next';
import { useEffect, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { FiltersBar, FormattingProvider, I18nProvider } from 'ui-design-system';
import type { FilterChange, FilterDescriptor } from 'ui-design-system/src/FiltersBar/types';
import { Icon } from 'ui-icons';

interface LoaderData {
  scenarioId: string;
  scenarios: Scenario[];
  scenarioVersions: Array<{
    version: number;
    createdAt: string;
  }>;
}

export const handle = {
  i18n: ['navigation', 'filters', 'analytics'] satisfies Namespace,
  BreadCrumbs: [
    ({ isLast }: BreadCrumbProps) => {
      const { t } = useTranslation(['navigation', 'filters', 'analytics']);

      return (
        <BreadCrumbLink to={getRoute('/analytics')} isLast={isLast}>
          <Icon icon="analytics" className="me-2 size-6" />
          <span className="line-clamp-1 text-start">{t('navigation:analytics')}</span>
        </BreadCrumbLink>
      );
    },
  ],
};

export async function loader({ request, params }: LoaderFunctionArgs): Promise<Response> {
  const { authService } = initServerServices(request);
  const { scenario } = await authService.isAuthenticated(request, {
    failureRedirect: getRoute('/sign-in'),
  });

  const scenarioId = fromParams(params, 'scenarioId');

  const [scenarios, scenarioIterations] = await Promise.all([
    scenario.listScenarios(),
    scenario.listScenarioIterations({ scenarioId }),
  ]);

  return Response.json({
    scenarioId,
    scenarios,
    scenarioVersions: scenarioIterations
      .filter(({ version }) => version !== null)
      .map(({ version, createdAt }) => ({
        version,
        createdAt,
      })),
  });
}

export default function Analytics() {
  const { scenarios, scenarioVersions } = useLoaderData<LoaderData>();

  const scenarioId = useParam('scenarioId');
  const [searchParams] = useSearchParams();
  // const queryClient = useQueryClient();
  const { t, i18n } = useTranslation(['filters', 'analytics']);

  const navigate = useNavigate();
  const queryString = searchParams.get('q');

  useEffect(() => {
    if (!queryString) {
      return navigate(
        {
          pathname: getRoute('/analytics/:scenarioId', { scenarioId: fromUUIDtoSUUID(scenarioId) }),
          search: `?q=${btoa(JSON.stringify({ range: { type: 'dynamic', fromNow: '-P30D' } }))}`,
        },
        { replace: true },
      );
    }
  }, [scenarioId, navigate, queryString]);

  const parsedFiltersResult = useMemo<AnalyticsFiltersQuery | null>(() => {
    try {
      const decoded = queryString ? atob(queryString) : null;
      return decoded ? analyticsFiltersQuery.parse(JSON.parse(decoded)) : null;
    } catch (error) {
      console.log('error', error);
      return null;
    }
  }, [queryString]);

  const filtersValues = useMemo(() => {
    const { trigger, scenarioVersion: _scenarioVersion, ...rest } = parsedFiltersResult ?? {};
    return {
      scenarioId,
      ...rest,
      ...Object.fromEntries(trigger?.map((t) => [t.name, t]) ?? []),
    };
  }, [parsedFiltersResult, scenarioId]);

  const { data: availableFilters } = useGetAvailableFilters({
    ranges: [
      ...(parsedFiltersResult?.range ? [parsedFiltersResult.range] : []),
      ...(parsedFiltersResult?.compareRange ? [parsedFiltersResult.compareRange] : []),
    ].filter(Boolean),
    scenarioId,
  });

  type AvailableFiltersDescriptor = FilterDescriptor & {
    source?: FilterSource;
  };
  const { dynamicDescriptors } = useMemo(() => {
    const index: Record<string, unknown> = {};
    const descriptors: AvailableFiltersDescriptor[] = (availableFilters ?? []).map((filter) => {
      const common = {
        name: filter.name,
        placeholder: filter.name,
        removable: true as const,
        source: filter.source,
      };
      switch (filter.type) {
        case 'string':
          index[filter.name] = { source: filter.source, kind: 'text' };
          return { ...common, type: 'text', operator: 'in' as const };
        case 'number':
          index[filter.name] = { source: filter.source, kind: 'number' };
          return { ...common, type: 'number', operator: 'eq' as const };
        case 'boolean':
          index[filter.name] = { source: filter.source, kind: 'boolean' };
          return { ...common, type: 'boolean' as const };
      }
    }) as AvailableFiltersDescriptor[];

    return { dynamicDescriptors: descriptors };
  }, [availableFilters]);

  const {
    data: { decisionOutcomesPerDay: decisionsData, ruleHitTable: ruleHitTableData } = {
      decisionOutcomesPerDay: null,
    },
    isFetching: _isAnalyticsPending,
  } = useGetAnalytics({
    scenarioId,
    queryString: queryString ?? '',
  });

  const onFiltersChange = (change: FilterChange, next: { value: Record<string, unknown> }) => {
    // Handle scenario id routing
    if (change.type === 'set' && change.name === 'scenario') {
      const newScenarioId = change.value as string | null;
      if (newScenarioId) {
        navigate(
          {
            pathname: getRoute('/analytics/:scenarioId', {
              scenarioId: fromUUIDtoSUUID(newScenarioId),
            }),
            search: `?q=${btoa(JSON.stringify(parsedFiltersResult))}`,
          },
          { replace: true },
        );

        // setScenarioId(newScenarioId as UUID);
        return;
      }
    }

    if (change.type === 'set') {
      if (dynamicDescriptors.find((d) => d.name === change.name)) {
        const raw = change.value as unknown;
        const OP_MAP: Record<string, '=' | '!=' | '>' | '>=' | '<' | '<=' | 'in'> = {
          eq: '=',
          ne: '!=',
          gt: '>',
          gte: '>=',
          lt: '<',
          lte: '<=',
        } as const;

        let newTrigger: {
          name: string;
          op: '=' | '!=' | '>' | '>=' | '<' | '<=' | 'in';
          value: Array<string | number | boolean>;
        } | null = null;

        if (Array.isArray(raw)) {
          const values = (raw as Array<{ value: unknown }>).flatMap((f) =>
            Array.isArray((f as any).value)
              ? ((f as any).value as Array<string | number | boolean>)
              : [(f as any).value as string | number | boolean],
          );
          newTrigger = { name: change.name, op: 'in', value: values };
        } else if (
          raw != null &&
          typeof raw === 'object' &&
          'operator' in (raw as Record<string, unknown>)
        ) {
          const opKey = (raw as { operator: string }).operator;
          const op = OP_MAP[opKey] ?? (opKey as '=' | '!=' | '>' | '>=' | '<' | '<=' | 'in');
          const valRaw = (raw as { value: unknown }).value as unknown;
          const values = Array.isArray(valRaw)
            ? (valRaw as Array<string | number | boolean>)
            : [valRaw as string | number | boolean];
          newTrigger = { name: change.name, op, value: values };
        } else if (typeof raw === 'boolean') {
          newTrigger = { name: change.name, op: '=', value: [raw] };
        } else {
          newTrigger = null;
        }

        const nextQuery = {
          ...parsedFiltersResult,
          trigger: [...(parsedFiltersResult?.trigger ?? []), ...(newTrigger ? [newTrigger] : [])],
        };

        console.log(
          'dynamicDescriptors spotted, navigating to new url',
          JSON.stringify(nextQuery, null, 2),
        );
        return navigate(
          {
            pathname: getRoute('/analytics/:scenarioId', {
              scenarioId: fromUUIDtoSUUID(scenarioId),
            }),
            search: `?q=${btoa(JSON.stringify(nextQuery))}`,
          },
          { replace: true },
        );
      }

      return navigate(
        {
          pathname: getRoute('/analytics/:scenarioId', { scenarioId: fromUUIDtoSUUID(scenarioId) }),
          search: `?q=${btoa(
            JSON.stringify({
              ...parsedFiltersResult,
              [change.name]: change.value,
            }),
          )}`,
        },
        { replace: true },
      );
    }

    if (change.type === 'remove') {
      const nextQuery = {
        ...parsedFiltersResult,
        trigger: parsedFiltersResult?.trigger?.filter((t) => t.name !== change.name),
      };
      return navigate(
        {
          pathname: getRoute('/analytics/:scenarioId', { scenarioId: fromUUIDtoSUUID(scenarioId) }),
          search: `?q=${btoa(JSON.stringify(nextQuery))}`,
        },
        { replace: true },
      );
    }
  };
  const descriptors: FilterDescriptor[] = [
    {
      type: 'select',
      name: 'scenario',
      placeholder: t('analytics:filters.select_scenario.placeholder'),
      options: scenarios.map((scenario) => ({ label: scenario.name, value: scenario.id })),
    },
    {
      type: 'date-range-popover',
      name: 'range',
      placeholder: t('analytics:filters.select_date_range.placeholder'),
    },
    {
      type: 'date-range-popover',
      name: 'compareRange',
      placeholder: t('analytics:filters.select_comparison_date_range.placeholder'),
      removable: true,
    },
  ];

  return (
    <FormattingProvider
      value={{
        language: i18n.language,
        formatDateTimeWithoutPresets: (d, opts) =>
          formatDateTimeWithoutPresets(d, { language: i18n.language, ...(opts ?? {}) }),
        formatDuration: (dur, lang) => formatDuration(dur, lang ?? i18n.language),
      }}
    >
      <I18nProvider
        value={{
          locale: i18n.language,
          t: t as (key: string, options?: Record<string, unknown>) => string,
        }}
      >
        <div className="overflow-y-auto">
          <div className="flex flex-1 flex-col overflow-y-auto max-w-6xl p-v2-lg">
            <div className="flex flex-row gap-v2-md mb-v2-lg">
              <div className="flex flex-row gap-v2-sm items-start min-h-[88px]">
                <FiltersBar
                  descriptors={descriptors}
                  dynamicDescriptors={dynamicDescriptors}
                  value={filtersValues}
                  onChange={onFiltersChange}
                />
              </div>
            </div>
            <Decisions
              data={decisionsData as DecisionOutcomesPerPeriod}
              scenarioVersions={scenarioVersions}
              isLoading={false}
            />
            <RulesHit data={ruleHitTableData ?? []} isLoading={false} />
          </div>
        </div>
      </I18nProvider>
    </FormattingProvider>
  );
}

export function ErrorBoundary() {
  const error = useRouteError();
  captureRemixErrorBoundaryError(error);

  //TODO: handle 404 error if needed but it should not occur

  return <ErrorComponent error={error} />;
}

export function shouldRevalidate() {
  // Always return false to prevent full page re-renders
  // Query invalidation is handled in the component's useEffect
  return false;
}
