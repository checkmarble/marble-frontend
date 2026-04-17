import { ErrorComponent, Page } from '@app-builder/components';
import { Decisions } from '@app-builder/components/Analytics/Decisions';
import { DecisionsScoreDistribution } from '@app-builder/components/Analytics/DecisionsScoreDistribution';
import { RulesHit } from '@app-builder/components/Analytics/RulesHit';
import { RuleVsDecisionOutcomes } from '@app-builder/components/Analytics/RuleVsDecisionOutcomes';
import { ScreeningHits } from '@app-builder/components/Analytics/ScreeningHits';
import { UpsellCard } from '@app-builder/components/Analytics/UpsellCard';
import { DetectionNavigationTabs } from '@app-builder/components/Detection';
import { authMiddleware } from '@app-builder/middlewares/auth-middleware';
import type {
  DateRangeFilter as AnalyticsDateRangeFilter,
  AvailableFiltersResponse,
} from '@app-builder/models/analytics';
import { type AnalyticsFiltersQuery, analyticsFiltersQuery, FilterSource } from '@app-builder/models/analytics';
import { type Scenario } from '@app-builder/models/scenario';
import { useGetAvailableFilters } from '@app-builder/queries/analytics/get-available-filters';
import { useAnalyticsDataQuery } from '@app-builder/queries/analytics/get-data';
import { isAnalyticsAvailable } from '@app-builder/services/feature-access';
import { formatDateTimeWithoutPresets, formatDuration } from '@app-builder/utils/format';
import { fromSUUIDtoUUID } from '@app-builder/utils/short-uuid';
import * as Sentry from '@sentry/react';
import { createFileRoute, Link, useNavigate } from '@tanstack/react-router';
import { createServerFn } from '@tanstack/react-start';
import { useEffect, useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { FiltersBar, FormattingProvider, I18nProvider } from 'ui-design-system';
import type { FilterChange, FilterDescriptor, FilterValue } from 'ui-design-system/src/FiltersBar/types';
import { Icon } from 'ui-icons';
import { z } from 'zod/v4';

interface LoaderData {
  scenarioId: string;
  scenarios: Scenario[];
  scenarioVersions: Array<{
    version: number;
    createdAt: string;
  }>;
  isAnalyticsAvailable: boolean;
}

const paramsSchema = z.object({
  scenarioId: z.string().transform((id) => fromSUUIDtoUUID(id)),
});

const searchParamsSchema = z.object({
  q: z.string().default(() => btoa(JSON.stringify({ range: { type: 'dynamic', fromNow: '-P30D' } }))),
});

const analyticsLoader = createServerFn()
  .middleware([authMiddleware])
  .inputValidator(paramsSchema)
  .handler(async function analyticsLoader({ data, context }) {
    const { scenario, user, entitlements } = context.authInfo;

    const [scenarios, scenarioIterations] = await Promise.all([
      scenario.listScenarios(),
      scenario.listScenarioIterations({ scenarioId: data.scenarioId }),
    ]);

    return {
      scenarioId: data.scenarioId,
      scenarios,
      scenarioVersions: scenarioIterations
        .filter(({ version }) => version !== null)
        .map(({ version, createdAt }) => ({
          version,
          createdAt,
        })),
      isAnalyticsAvailable: isAnalyticsAvailable(user, entitlements),
    };
  });

export const Route = createFileRoute('/_app/_builder/detection/analytics/$scenarioId')({
  validateSearch: searchParamsSchema,
  loader: ({ params }) => analyticsLoader({ data: params }),
  staleTime: Infinity,
  errorComponent: ({ error }) => {
    Sentry.captureException(error);
    return <ErrorComponent error={error} />;
  },
  component: Analytics,
});

function Analytics() {
  const {
    scenarioId,
    scenarios,
    scenarioVersions,
    isAnalyticsAvailable: hasAnalyticsLicense,
  } = Route.useLoaderData() as LoaderData;

  const { t, i18n } = useTranslation(['filters', 'analytics']);
  const navigate = useNavigate();
  const { q: queryString } = Route.useSearch();

  const parsedFiltersResult = useMemo<AnalyticsFiltersQuery | null>(() => {
    try {
      const decoded = queryString ? atob(queryString) : null;
      return decoded ? analyticsFiltersQuery.parse(JSON.parse(decoded)) : null;
    } catch {
      return null;
    }
  }, [queryString]);

  const [volatileScenarioId, setVolatileScenarioId] = useState<string | null>(null);
  const [volatileRange, setVolatileRange] = useState<AnalyticsDateRangeFilter | undefined>();
  const [volatileCompareRange, setVolatileCompareRange] = useState<AnalyticsDateRangeFilter | undefined>();

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

  const {
    decisionsOutcomesPerDayQuery,
    decisionsScoreDistributionQuery,
    ruleHitTableQuery,
    ruleVsDecisionOutcomeQuery,
    screeningHitsTableQuery,
  } = useAnalyticsDataQuery({ scenarioId, queryString: queryString ?? '' });

  const onFiltersUpdate = (next: { value: Record<string, FilterValue> }) => {
    const draft = next.value;

    const nextScenarioId = (draft['scenarioId'] as string | undefined) ?? scenarioId;

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

    navigate({
      from: '/detection/analytics/$scenarioId',
      to: '.',
      search: {
        q: btoa(JSON.stringify(nextQuery)),
      },
    });
  };

  const onInstantUpdate = (change: FilterChange): void => {
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
    {
      type: 'date-range-popover',
      name: 'compareRange',
      placeholder: t('analytics:filters.select_comparison_date_range.placeholder'),
      removable: true,
      instantUpdate: true,
    },
  ];

  return (
    <Page.Main className="bg-grey-background-light">
      <Page.Container>
        <Page.ContentV2 className="gap-v2-md">
          <DetectionNavigationTabs
            actions={
              <Link
                to="/analytics-legacy"
                target="_blank"
                className="text-s text-grey-secondary flex flex-row items-center font-semibold gap-v2-xs"
              >
                <Icon icon="openinnew" className="size-4" />
                <span>{t('analytics:legacy-analytics-link')}</span>
              </Link>
            }
          />
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
              <div className="bg-surface-page min-[2000px]:px-40 flex flex-col gap-v2-md">
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
                <div className="flex flex-col lg-analytics:flex-row gap-v2-md w-full items-stretch h-auto">
                  <div className={hasAnalyticsLicense ? 'lg-analytics:basis-2/3 min-w-0' : 'min-w-0 w-full'}>
                    <Decisions
                      data={decisionsOutcomesPerDayQuery.data ?? null}
                      scenarioVersions={scenarioVersions}
                      isLoading={decisionsOutcomesPerDayQuery.isFetching}
                    />
                  </div>
                  {hasAnalyticsLicense ? (
                    <div className="lg-analytics:basis-1/3 min-w-0">
                      <DecisionsScoreDistribution query={decisionsScoreDistributionQuery} />
                    </div>
                  ) : null}
                </div>

                {hasAnalyticsLicense ? (
                  <>
                    <RulesHit
                      isComparingRanges={effectiveRanges.length > 1}
                      data={ruleHitTableQuery.data ?? []}
                      isLoading={ruleHitTableQuery.isFetching}
                    />
                    <RuleVsDecisionOutcomes
                      data={ruleVsDecisionOutcomeQuery.data ?? null}
                      isLoading={ruleVsDecisionOutcomeQuery.isFetching}
                    />
                    <ScreeningHits
                      data={screeningHitsTableQuery.data ?? []}
                      isLoading={screeningHitsTableQuery.isFetching}
                    />
                  </>
                ) : (
                  <UpsellCard
                    title={t('analytics:upsell.title')}
                    description={t('analytics:upsell.description')}
                    benefits={[
                      t('analytics:upsell.benefit_1'),
                      t('analytics:upsell.benefit_2'),
                      t('analytics:upsell.benefit_3'),
                    ]}
                  />
                )}
              </div>
            </I18nProvider>
          </FormattingProvider>
        </Page.ContentV2>
      </Page.Container>
    </Page.Main>
  );
}
