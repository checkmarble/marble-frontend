import { ErrorComponent } from '@app-builder/components';
import { Decisions } from '@app-builder/components/Analytics/Decisions';
import { DecisionsScoreDistribution } from '@app-builder/components/Analytics/DecisionsScoreDistribution';
import { RulesHit } from '@app-builder/components/Analytics/RulesHit';
import { RuleVsDecisionOutcomes } from '@app-builder/components/Analytics/RuleVsDecisionOutcomes';
import { ScreeningHits } from '@app-builder/components/Analytics/ScreeningHits';
import { BreadCrumbLink, type BreadCrumbProps } from '@app-builder/components/Breadcrumbs';
import { useAgnosticNavigation } from '@app-builder/contexts/AgnosticNavigationContext';
import type {
  DateRangeFilter as AnalyticsDateRangeFilter,
  AvailableFiltersResponse,
  Outcome,
} from '@app-builder/models/analytics';
import { type AnalyticsFiltersQuery, analyticsFiltersQuery, FilterSource } from '@app-builder/models/analytics';
import { type Scenario } from '@app-builder/models/scenario';
import { useGetAvailableFilters } from '@app-builder/queries/analytics/get-available-filters';
import {
  useGetDecisionsOutcomesPerDay,
  useGetDecisionsScoreDistribution,
  useGetRuleHitTable,
  useGetRuleVsDecisionOutcome,
  useGetScreeningHitsTable,
} from '@app-builder/queries/analytics/get-data';
import { initServerServices } from '@app-builder/services/init.server';
import { formatDateTimeWithoutPresets, formatDuration } from '@app-builder/utils/format';
import { getRoute } from '@app-builder/utils/routes';
import { fromParams, fromUUIDtoSUUID, useParam } from '@app-builder/utils/short-uuid';
import type { LoaderFunctionArgs } from '@remix-run/node';
import { useLoaderData, useRouteError, useSearchParams } from '@remix-run/react';
import { captureRemixErrorBoundaryError } from '@sentry/remix';
import { type Namespace } from 'i18next';
import { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { FiltersBar, FormattingProvider, I18nProvider } from 'ui-design-system';
import type { FilterChange, FilterDescriptor, FilterValue } from 'ui-design-system/src/FiltersBar/types';
import { Icon } from 'ui-icons';

interface LoaderData {
  scenarioId: string;
  scenarios: Scenario[];
  scenarioVersions: Array<{
    version: number;
    createdAt: string;
  }>;
}

import { useRef } from 'react';

export const OUTCOME_COLORS: Record<Outcome, string> = {
  approve: '#46BB7F',
  review: '#FDBD35',
  blockAndReview: '#FF8533',
  decline: '#DB5F4A',
};

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
  const { t, i18n } = useTranslation(['filters', 'analytics']);

  const navigate = useAgnosticNavigation();
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
    } catch {
      return null;
    }
  }, [queryString]);

  // Volatile overrides for instant updates (no navigation)
  const [volatileScenarioId, setVolatileScenarioId] = useState<string | null>(null);
  const [volatileRange, setVolatileRange] = useState<AnalyticsDateRangeFilter | undefined>();
  const [volatileCompareRange, setVolatileCompareRange] = useState<AnalyticsDateRangeFilter | undefined>();

  // Reset volatile overrides when URL query changes (after Apply)
  useEffect(() => {
    setVolatileScenarioId(null);
    setVolatileRange(undefined);
    setVolatileCompareRange(undefined);
  }, [queryString]);

  const filtersValues = useMemo(() => {
    const { trigger, scenarioVersion: _scenarioVersion, ...rest } = parsedFiltersResult ?? {};
    return {
      scenarioId,
      ...rest,
      ...Object.fromEntries(trigger?.map((t) => [t.name, t]) ?? []),
    };
  }, [parsedFiltersResult, scenarioId]);

  const effectiveScenarioId = volatileScenarioId ?? scenarioId;
  const effectiveRanges: AnalyticsDateRangeFilter[] = useMemo(() => {
    const primary = (volatileRange ?? parsedFiltersResult?.range) as AnalyticsDateRangeFilter | undefined;
    const secondary = (volatileCompareRange ?? parsedFiltersResult?.compareRange) as
      | AnalyticsDateRangeFilter
      | undefined;
    return [primary, secondary].filter(Boolean) as AnalyticsDateRangeFilter[];
  }, [volatileRange, volatileCompareRange, parsedFiltersResult]);

  const { data: availableFilters } = useGetAvailableFilters({
    ranges: effectiveRanges,
    scenarioId: effectiveScenarioId,
  });

  const seenAvailableFilters = useRef<Map<string, AvailableFiltersResponse[number]>>(new Map());

  useEffect(() => {
    availableFilters?.forEach((filter) => {
      seenAvailableFilters.current.set(filter.name, filter);
    });
  }, [availableFilters]);

  type AvailableFiltersDescriptor = FilterDescriptor & {
    source?: FilterSource;
    unavailable?: boolean;
  };

  const dynamicDescriptors: AvailableFiltersDescriptor[] = useMemo(() => {
    const descriptors: Map<string, AvailableFiltersDescriptor> = new Map();

    const appendToDescriptors = (filter: AvailableFiltersResponse[number], unavailable: boolean): void => {
      const baseDescriptor = {
        name: filter.name,
        placeholder: filter.name,
        removable: true,
        unavailable,
        source: filter.source,
      };
      switch (filter.type) {
        case 'string':
          descriptors.set(filter.name, {
            ...baseDescriptor,
            type: 'text',
            op: 'in',
          });
          break;
        case 'number':
          descriptors.set(filter.name, {
            ...baseDescriptor,
            type: 'number',
            op: '=',
          });
          break;
        case 'boolean':
          descriptors.set(filter.name, {
            ...baseDescriptor,
            type: 'boolean',
          });
          break;
      }
    };

    seenAvailableFilters.current.forEach((filter) => appendToDescriptors(filter, true));
    availableFilters?.forEach((filter) => appendToDescriptors(filter, false));

    return Array.from(descriptors.values());
  }, [availableFilters, seenAvailableFilters]);

  const decisionsOutcomesPerDayData = useGetDecisionsOutcomesPerDay({
    scenarioId,
    queryString: queryString ?? '',
  });
  const decisionsScoreDistributionData = useGetDecisionsScoreDistribution({
    scenarioId,
    queryString: queryString ?? '',
  });
  const ruleHitTableData = useGetRuleHitTable({
    scenarioId,
    queryString: queryString ?? '',
  });
  const ruleVsDecisionOutcomeData = useGetRuleVsDecisionOutcome({
    scenarioId,
    queryString: queryString ?? '',
  });
  const screeningHitsTableData = useGetScreeningHitsTable({
    scenarioId,
    queryString: queryString ?? '',
  });

  const onFiltersUpdate = (next: { value: Record<string, FilterValue> }) => {
    const draft = next.value;

    const nextScenarioId = (draft['scenarioId'] as string | undefined) ?? scenarioId;

    // Create a map of filter name -> filter descriptor for type-based logic
    const filterDescriptorMap = new Map<string, FilterDescriptor>(
      [...descriptors, ...dynamicDescriptors].map((d) => [d.name, d]),
    );

    const trigger = Object.entries(draft as Record<string, unknown>).flatMap(([name, v]) => {
      const val = v as FilterValue;
      if (name === 'scenarioId' || name === 'range' || name === 'compareRange') return [] as any[];

      const descriptor = filterDescriptorMap.get(name);
      if (!descriptor) return [] as any[];

      switch (descriptor.type) {
        case 'text': {
          // Text filter: TextComparisonFilter with {op: 'in', value: ['AAA', 'BBB']}
          if (!val || typeof val !== 'object' || !('op' in val) || !('value' in val)) {
            return [] as any[];
          }
          const textFilter = val as { op: string; value: unknown };
          const values = Array.isArray(textFilter.value)
            ? (textFilter.value as string[]).filter((v) => v != null && String(v).length > 0)
            : [];
          return values.length ? [{ name, op: textFilter.op, value: values, unavailable: descriptor.unavailable }] : [];
        }

        case 'number': {
          // Number filter: NumberComparisonFilter with op and value
          if (!val || typeof val !== 'object' || !('op' in val) || !('value' in val)) {
            return [] as any[];
          }
          const numFilter = val as { op: string; value: unknown };
          const raw = numFilter.value;
          const values = Array.isArray(raw) ? raw : [raw];
          const cleaned = (values as Array<string | number | boolean>).filter(
            (v) => v !== null && v !== undefined && (typeof v !== 'string' || v.length > 0),
          );
          return cleaned.length
            ? [{ name, op: numFilter.op, value: cleaned, unavailable: descriptor.unavailable }]
            : [];
        }

        case 'boolean': {
          // Boolean filter: boolean value
          if (typeof val !== 'boolean') return [] as any[];
          return [{ name, op: '=', value: [val], unavailable: descriptor.unavailable }];
        }

        default:
          return [] as any[];
      }
    });

    const nextQuery: AnalyticsFiltersQuery = {
      range: (draft['range'] as unknown as AnalyticsFiltersQuery['range']) ??
        (parsedFiltersResult?.range as AnalyticsFiltersQuery['range']) ?? {
          type: 'dynamic',
          fromNow: '-P30D',
        },
      compareRange: draft['compareRange'] as AnalyticsFiltersQuery['compareRange'],
      ...(parsedFiltersResult?.scenarioVersion ? { scenarioVersion: parsedFiltersResult.scenarioVersion } : {}),
      ...(trigger.length && nextScenarioId === scenarioId ? { trigger } : {}),
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

  const onInstantUpdate = (change: FilterChange): void => {
    // Refetch available filters on instant updates without navigation
    if (change.type === 'set') {
      switch (change.name) {
        case 'scenarioId':
          return setVolatileScenarioId(change.value as string);
        case 'range':
          return setVolatileRange(change.value as AnalyticsDateRangeFilter);
        case 'compareRange':
          return setVolatileCompareRange(change.value as AnalyticsDateRangeFilter);
      }
    }
    if (change.type === 'remove' && change.name === 'compareRange') {
      return setVolatileCompareRange(undefined);
    }
  };
  const descriptors: FilterDescriptor[] = [
    {
      type: 'select',
      name: 'scenarioId',
      placeholder: 'placeholder-do-not-happen',
      options: scenarios.map((scenario) => ({ label: scenario.name, value: scenario.id })),
      removable: false,
      instantUpdate: true,
    },
    {
      type: 'date-range-popover',
      name: 'range',
      placeholder: 'placeholder-do-not-happen',
      removable: false,
      instantUpdate: true,
    },
    // {
    //   type: 'date-range-popover',
    //   name: 'compareRange',
    //   placeholder: t('analytics:filters.select_comparison_date_range.placeholder'),
    //   removable: true,
    //   instantUpdate: true,
    // },
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
          <div className="flex flex-col overflow-y-auto p-v2-lg">
            <div className="flex flex-row gap-v2-md mb-v2-lg w-full">
              <div className="flex flex-row gap-v2-sm items-start min-h-[88px] w-full">
                <FiltersBar
                  descriptors={descriptors}
                  dynamicDescriptors={dynamicDescriptors}
                  value={filtersValues}
                  onUpdate={onFiltersUpdate}
                  onChange={(change, _next) => onInstantUpdate(change)}
                />
              </div>
            </div>
            <div className="flex flex-row gap-v2-md w-full items-stretch">
              <div className="basis-3/4 min-w-0">
                <Decisions
                  data={decisionsOutcomesPerDayData?.data ?? null}
                  scenarioVersions={scenarioVersions}
                  isLoading={decisionsOutcomesPerDayData?.isFetching ?? true}
                />
              </div>
              <div className="basis-1/4 min-w-0">
                <DecisionsScoreDistribution data={decisionsScoreDistributionData?.data ?? null} />
              </div>
            </div>

            <RulesHit data={ruleHitTableData?.data ?? []} isLoading={ruleHitTableData?.isFetching ?? true} />
            <RuleVsDecisionOutcomes
              data={ruleVsDecisionOutcomeData?.data ?? null}
              isLoading={ruleVsDecisionOutcomeData?.isFetching ?? true}
            />
            <ScreeningHits
              data={screeningHitsTableData?.data ?? []}
              isLoading={screeningHitsTableData?.isFetching ?? true}
            />
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
