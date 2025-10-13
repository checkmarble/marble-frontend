import { ErrorComponent } from '@app-builder/components';
import { Decisions } from '@app-builder/components/Analytics/Decisions';
import { RulesHit } from '@app-builder/components/Analytics/RulesHit';
import { BreadCrumbLink, type BreadCrumbProps } from '@app-builder/components/Breadcrumbs';
import { type DecisionOutcomesPerPeriod, FilterSource } from '@app-builder/models/analytics';
import { RuleHitTableResponse } from '@app-builder/models/analytics/rule-hit';
import { type Scenario } from '@app-builder/models/scenario';
import { useGetAnalytics } from '@app-builder/queries/analytics/get-analytics';
import { useGetAvailableFilters } from '@app-builder/queries/analytics/get-available-filters';
import { initServerServices } from '@app-builder/services/init.server';
import { formatDateTimeWithoutPresets, formatDuration } from '@app-builder/utils/format';
import { getRoute } from '@app-builder/utils/routes';
import { fromParams, fromUUIDtoSUUID, useParam } from '@app-builder/utils/short-uuid';
import { type LoaderFunctionArgs, redirect } from '@remix-run/node';
import { useLoaderData, useRouteError, useSearchParams } from '@remix-run/react';
import { captureRemixErrorBoundaryError } from '@sentry/remix';
import { useQueryClient } from '@tanstack/react-query';
import { subMonths } from 'date-fns';
import { type Namespace } from 'i18next';
import { useEffect, useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { UUID } from 'short-uuid';
import { FiltersBar, FormattingProvider, I18nProvider } from 'ui-design-system';
import type {
  DateRangeFilterType,
  FilterChange,
  FilterDescriptor,
} from 'ui-design-system/src/FiltersBar/types';
import { Icon } from 'ui-icons';
import z from 'zod';

interface LoaderData {
  scenarioId: string;
  scenarios: Scenario[];
  scenarioVersions: Array<{
    version: number;
    createdAt: string;
  }>;
}

// Schema for parsing URL query parameters
const qSchema = z
  .object({
    range: z.object({ start: z.iso.datetime(), end: z.iso.datetime() }),
    compareRange: z
      .object({ start: z.iso.datetime(), end: z.iso.datetime() })
      .nullable()
      .optional(),
  })
  .refine((v) => new Date(v.range.start).getTime() <= new Date(v.range.end).getTime(), {
    message: 'Invalid date range payload',
  })
  .refine(
    (v) => {
      const cr = v.compareRange;
      if (!cr) return true;
      return new Date(cr.start).getTime() <= new Date(cr.end).getTime();
    },
    { message: 'Invalid compare range payload' },
  );

export const handle = {
  i18n: ['navigation', 'data'] satisfies Namespace,
  BreadCrumbs: [
    ({ isLast }: BreadCrumbProps) => {
      const { t } = useTranslation(['navigation', 'filters']);

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

  const url = new URL(request.url);

  const q = url.searchParams.get('q');

  const redirectWithQ = (payload: {
    range: { start: string; end: string };
    compareRange?: { start: string; end: string } | null;
  }) => {
    url.searchParams.set('q', btoa(JSON.stringify(payload)));
    return redirect(url.toString());
  };

  let parsed: {
    range: { start: string; end: string };
    compareRange: { start: string; end: string } | null;
  } | null = null;

  if (q) {
    try {
      const obj = JSON.parse(atob(q));
      const safe = qSchema.safeParse(obj);
      if (safe.success) {
        parsed = { range: safe.data.range, compareRange: safe.data.compareRange ?? null };
      }
    } catch {
      // fallthrough: parsed stays null
    }
  }

  if (!parsed) {
    const now = new Date();
    now.setUTCHours(0, 0, 0, 0);
    const startDefault = subMonths(now, 1);
    startDefault.setUTCHours(0, 0, 0, 0);

    return redirectWithQ({
      range: { start: startDefault.toISOString(), end: now.toISOString() },
      compareRange: null,
    });
  }

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
  const urlScenarioId = useParam('scenarioId');
  const [searchParams] = useSearchParams();
  const queryClient = useQueryClient();
  const { t, i18n } = useTranslation(['filters']);

  const [scenarioId, setScenarioId] = useState(urlScenarioId);

  type DynamicKind = 'text' | 'number' | 'boolean';
  type DynamicMeta = Record<string, { source: FilterSource; kind: DynamicKind }>;
  const [dynamicMeta, setDynamicMeta] = useState<DynamicMeta>({});

  useEffect(() => {
    setScenarioId(urlScenarioId);
  }, [urlScenarioId]);

  const q = searchParams.get('q');
  let parsedDateRange: {
    range: { start: string; end: string };
    compareRange: { start: string; end: string } | null;
  } | null = null;

  if (q) {
    try {
      const obj = JSON.parse(atob(q));
      const safe = qSchema.safeParse(obj);
      if (safe.success) {
        parsedDateRange = { range: safe.data.range, compareRange: safe.data.compareRange ?? null };
      }
    } catch {
      // fallthrough: parsedDateRange stays null
    }
  }

  const initialRange =
    parsedDateRange?.range ??
    (() => {
      const now = new Date();
      now.setUTCHours(0, 0, 0, 0);
      const startDefault = subMonths(now, 1);
      startDefault.setUTCHours(0, 0, 0, 0);
      return { start: startDefault.toISOString(), end: now.toISOString() };
    })();
  const initialCompare = parsedDateRange?.compareRange ?? null;

  const [filtersValue, setFiltersValue] = useState<Record<string, unknown>>({
    scenario: urlScenarioId,
    dateRange: {
      type: 'static',
      startDate: initialRange.start,
      endDate: initialRange.end,
    } satisfies DateRangeFilterType,
    compareDateRange: initialCompare
      ? ({ type: 'static', startDate: initialCompare.start, endDate: initialCompare.end } as const)
      : null,
  });
  const [activeDynamicFilters, setActiveDynamicFilters] = useState<string[]>([]);
  const deriveIsoRange = (v: unknown): { start: string; end: string } | null => {
    const r = v as DateRangeFilterType | null | undefined;
    if (!r) return null;
    if (r.type === 'static') return { start: String(r.startDate), end: String(r.endDate) };
    return null; // ignore dynamic for backend queries
  };

  const currentRange = deriveIsoRange(filtersValue['dateRange']);
  const currentCompareRange = deriveIsoRange(filtersValue['compareDateRange']);

  const { data: availableFilters } = useGetAvailableFilters({
    scenarioId,
    dateRange: currentRange ?? initialRange,
  });

  type AvailableFiltersDescriptor = FilterDescriptor & {
    source?: FilterSource;
  };
  const { dynamicDescriptors, dynamicIndex } = useMemo(() => {
    const index: DynamicMeta = {};
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

    return { dynamicDescriptors: descriptors, dynamicIndex: index };
  }, [availableFilters]);

  useEffect(() => {
    const allowed = new Set(Object.keys(dynamicIndex));
    setActiveDynamicFilters((prev) => prev.filter((n) => allowed.has(n)));
    setFiltersValue((prev) => {
      const next = { ...prev };
      for (const key of Object.keys(prev)) {
        if (key === 'scenario' || key === 'dateRange' || key === 'compareDateRange') continue;
        if (!allowed.has(key)) delete next[key];
      }
      return next;
    });
    setDynamicMeta(dynamicIndex);
    queryClient.invalidateQueries({ queryKey: ['analytics'] });
  }, [dynamicIndex, queryClient]);

  const trigger = useMemo(() => {
    const out: {
      field: string;
      op: '=' | '!=' | '>' | '>=' | '<' | '<=' | 'in';
      values: string[];
    }[] = [];
    for (const name of activeDynamicFilters) {
      const meta = dynamicMeta[name];
      if (!meta) continue;
      const v = filtersValue[name];

      if (meta.kind === 'boolean') {
        if (typeof v === 'boolean') out.push({ field: name, op: '=', values: [String(v)] });
        continue;
      }
      if (meta.kind === 'number') {
        const c = v as {
          operator: 'eq' | 'ne' | 'lt' | 'lte' | 'gt' | 'gte';
          value: number;
        } | null;
        if (c && c.value !== undefined && c.value !== null) {
          const opMap: Record<
            'eq' | 'ne' | 'lt' | 'lte' | 'gt' | 'gte',
            '=' | '!=' | '>' | '>=' | '<' | '<='
          > = {
            eq: '=',
            ne: '!=',
            lt: '<',
            lte: '<=',
            gt: '>',
            gte: '>=',
          };
          out.push({ field: name, op: opMap[c.operator], values: [String(c.value)] });
        }
        continue;
      }
      // text
      const c = (v as { operator: 'in'; value: string }[] | null) ?? [];
      const values = c.map((x) => x.value).filter(Boolean);
      if (values.length) out.push({ field: name, op: 'in', values });
    }
    return out;
  }, [activeDynamicFilters, filtersValue, dynamicMeta]);

  const {
    data: { decisionOutcomesPerDay: decisionsData, ruleHitTable: ruleHitTableData } = {
      decisionOutcomesPerDay: null,
      ruleHitTable: [],
    },
    isFetching: isDecisionsPending,
  } = useGetAnalytics({
    scenarioId,
    scenarioVersion: undefined,
    dateRange: currentRange ?? initialRange,
    compareDateRange: currentCompareRange ?? undefined,
    trigger,
  });

  // Invalidate query when URL search params change
  const prevSearchParamsRef = useRef<string>('');

  useEffect(() => {
    const currentSearchParams = searchParams.toString();
    const searchParamsChanged =
      prevSearchParamsRef.current && prevSearchParamsRef.current !== currentSearchParams;

    if (searchParamsChanged) {
      // Invalidate all analytics queries when search params change
      queryClient.invalidateQueries({ queryKey: ['analytics'] });
    }

    prevSearchParamsRef.current = currentSearchParams;
  }, [searchParams, queryClient]);

  const onFiltersChange = (
    change: FilterChange,
    next: { value: Record<string, unknown>; active: string[] },
  ) => {
    console.log('onFiltersChange', change, next);
    console.log(next.active);
    setFiltersValue(next.value);
    setActiveDynamicFilters(next.active);
    console.log(filtersValue);

    // Handle scenario id routing
    if (change.type === 'set' && change.name === 'scenario') {
      const newScenarioId = change.value as string | null;
      if (newScenarioId) {
        const qs = searchParams.toString();
        const path = getRoute('/analytics/:scenarioId', {
          scenarioId: fromUUIDtoSUUID(newScenarioId as UUID),
        });
        const newUrl = qs ? `${path}?${qs}` : path;
        window.history.replaceState({}, '', newUrl);
        setScenarioId(newScenarioId as UUID);
        return;
      }
    }

    // Always sync date range params in URL
    const nextRange = deriveIsoRange(next.value['dateRange']) ?? initialRange;
    const nextCompare = deriveIsoRange(next.value['compareDateRange']);
    const url = new URL(window.location.href);
    url.searchParams.set(
      'q',
      btoa(
        JSON.stringify({
          range: nextRange,
          compareRange: nextCompare,
        }),
      ),
    );
    window.history.replaceState({}, '', url.toString());

    queryClient.invalidateQueries({ queryKey: ['analytics'] });
  };
  const descriptors: FilterDescriptor[] = [
    {
      type: 'select',
      name: 'scenario',
      placeholder: 'Select scenario',
      options: scenarios.map((scenario) => ({ label: scenario.name, value: scenario.id })),
    },
    {
      type: 'date-range-popover',
      name: 'dateRange',
      placeholder: 'Select date range',
    },
    {
      type: 'date-range-popover',
      name: 'compareDateRange',
      placeholder: 'Select comparison date range',
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
                  value={filtersValue}
                  active={activeDynamicFilters}
                  onChange={onFiltersChange}
                />
              </div>
            </div>
            <Decisions
              data={decisionsData as DecisionOutcomesPerPeriod}
              scenarioVersions={scenarioVersions}
              isLoading={isDecisionsPending}
            />
            <RulesHit
              data={ruleHitTableData as RuleHitTableResponse[]}
              isLoading={isDecisionsPending}
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
