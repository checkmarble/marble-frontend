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
import type { FilterDescriptor, FilterValue } from 'ui-design-system/src/FiltersBar/types';
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

  const { data: availableFilters, fetchStatus: avaiableFitlersFetchStatus } =
    useGetAvailableFilters({
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

  const onFiltersUpdate = (next: { value: Record<string, FilterValue> }) => {
    const draft = next.value;
    const OP_MAP: Record<string, '=' | '!=' | '>' | '>=' | '<' | '<=' | 'in'> = {
      eq: '=',
      ne: '!=',
      gt: '>',
      gte: '>=',
      lt: '<',
      lte: '<=',
      in: 'in',
    } as const;

    const nextScenarioId = (draft['scenarioId'] as string | undefined) ?? scenarioId;

    const trigger = Object.entries(draft as Record<string, unknown>).flatMap(([name, v]) => {
      const val = v as FilterValue;
      if (name === 'scenarioId' || name === 'range' || name === 'compareRange') return [] as any[];

      if (Array.isArray(val)) {
        // Text filter: flatten values
        const values = (val as Array<{ operator: string; value: string | string[] }>)
          .flatMap((f) => (Array.isArray(f.value) ? f.value : [f.value]))
          .filter((v) => v != null && String(v).length > 0);
        return values.length ? [{ name, op: 'in', value: values }] : [];
      }

      if (val && typeof val === 'object' && 'operator' in (val as any)) {
        const opKey = (val as { operator: string }).operator;
        const op = OP_MAP[opKey] ?? (opKey as '=' | '!=' | '>' | '>=' | '<' | '<=' | 'in');
        const raw = (val as { value: unknown }).value as unknown;
        const values = Array.isArray(raw) ? raw : [raw];
        const cleaned = (values as Array<string | number | boolean>).filter(
          (v) => v !== null && v !== undefined && (typeof v !== 'string' || v.length > 0),
        );
        return cleaned.length ? [{ name, op, value: cleaned }] : [];
      }

      if (typeof val === 'boolean') {
        return [{ name, op: '=', value: [val] }];
      }

      return [] as any[];
    });

    const nextQuery: AnalyticsFiltersQuery = {
      range: (draft['range'] as unknown as AnalyticsFiltersQuery['range']) ??
        (parsedFiltersResult?.range as AnalyticsFiltersQuery['range']) ?? {
          type: 'dynamic',
          fromNow: '-P30D',
        },
      compareRange: draft['compareRange'] as AnalyticsFiltersQuery['compareRange'],
      ...(parsedFiltersResult?.scenarioVersion
        ? { scenarioVersion: parsedFiltersResult.scenarioVersion }
        : {}),
      ...(trigger.length ? { trigger } : {}),
    };

    return navigate(
      {
        pathname: getRoute('/analytics/:scenarioId', {
          scenarioId: fromUUIDtoSUUID(nextScenarioId),
        }),
        search: `?q=${btoa(JSON.stringify(nextQuery))}`,
      },
      { replace: true },
    );
  };
  const descriptors: FilterDescriptor[] = [
    {
      type: 'select',
      name: 'scenarioId',
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
                  onUpdate={onFiltersUpdate}
                  options={{
                    dynamicSkeletons: {
                      enabled: true,
                      state: avaiableFitlersFetchStatus === 'fetching' ? 'loading' : 'success',
                    },
                  }}
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
