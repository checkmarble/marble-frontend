import { ErrorComponent } from '@app-builder/components';
import { Decisions } from '@app-builder/components/Analytics/Decisions';
import { BreadCrumbLink, type BreadCrumbProps } from '@app-builder/components/Breadcrumbs';
import { type DecisionOutcomesPerPeriod } from '@app-builder/models/analytics';
import { type Scenario } from '@app-builder/models/scenario';
import { useGetDecisionsOutcomesPerDay } from '@app-builder/queries/analytics/get-decisions-outcomes-per-day';
import { initServerServices } from '@app-builder/services/init.server';
import { getRoute } from '@app-builder/utils/routes';
import { fromParams, fromUUIDtoSUUID, useParam } from '@app-builder/utils/short-uuid';
import { type LoaderFunctionArgs, redirect } from '@remix-run/node';
import { useLoaderData, useRouteError, useSearchParams } from '@remix-run/react';
import { captureRemixErrorBoundaryError } from '@sentry/remix';
import { useQueryClient } from '@tanstack/react-query';
import { subMonths } from 'date-fns';
import { type Namespace } from 'i18next';
import { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { UUID } from 'short-uuid';
import { type DateRange, type Filter, FiltersBar } from 'ui-design-system';
import { Icon } from 'ui-icons';
import z from 'zod';

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

interface LoaderData {
  scenarioId: string;
  scenarios: Scenario[];
  scenarioVersions: Array<{
    version: number;
    createdAt: string;
  }>;
}

export const handle = {
  i18n: ['navigation', 'data'] satisfies Namespace,
  BreadCrumbs: [
    ({ isLast }: BreadCrumbProps) => {
      const { t } = useTranslation(['navigation']);

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

  const [scenarioId, setScenarioId] = useState(urlScenarioId);

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

  // Use default date range if no valid params found
  const dateRange =
    parsedDateRange?.range ||
    (() => {
      const now = new Date();
      now.setUTCHours(0, 0, 0, 0);
      const startDefault = subMonths(now, 1);
      startDefault.setUTCHours(0, 0, 0, 0);
      return { start: startDefault.toISOString(), end: now.toISOString() };
    })();

  const compareDateRange = parsedDateRange?.compareRange || null;

  const { data: decisionsData } = useGetDecisionsOutcomesPerDay({
    scenarioId,
    scenarioVersion: undefined,
    dateRange,
    compareDateRange: compareDateRange || undefined,
    trigger: [],
  });

  // Invalidate query when URL search params change
  const prevSearchParamsRef = useRef<string>('');

  useEffect(() => {
    const currentSearchParams = searchParams.toString();
    const searchParamsChanged =
      prevSearchParamsRef.current && prevSearchParamsRef.current !== currentSearchParams;

    if (searchParamsChanged) {
      // Invalidate all analytics queries when search params change
      queryClient.invalidateQueries({
        queryKey: ['analytics', 'decisions'],
      });
    }

    prevSearchParamsRef.current = currentSearchParams;
  }, [searchParams, queryClient]);

  const onScenariochange = (newScenarioId: string) => {
    const qs = searchParams.toString();
    const path = getRoute('/analytics/:scenarioId', { scenarioId: fromUUIDtoSUUID(newScenarioId) });
    const newUrl = qs ? `${path}?${qs}` : path;

    window.history.replaceState({}, '', newUrl);
    // window.history.pushState({}, '', newUrl);

    setScenarioId(newScenarioId as UUID);

    queryClient.invalidateQueries({
      queryKey: ['analytics', 'decisions', newScenarioId],
    });
  };

  // Create filter configurations for FiltersBar
  const filters: Filter[] = [
    {
      type: 'select' as const,
      name: 'scenario',
      placeholder: 'Select scenario',
      options: scenarios.map((scenario) => ({
        label: scenario.name,
        value: scenario.id,
      })),
      selectedValue: scenarioId,
      onChange: onScenariochange,
    },
    {
      type: 'date-range-popover' as const,
      name: 'dateRange',
      placeholder: 'Select date range',
      selectedValue: {
        from: new Date(dateRange.start),
        to: new Date(dateRange.end),
      },
      dateRange: {
        from: new Date(dateRange.start),
        to: new Date(dateRange.end),
      },
      onChange: (newRange: DateRange) => {
        console.log('newRange', newRange);
        // Update URL params when date range changes
        const newParams = {
          range: {
            start: newRange.from?.toISOString() ?? dateRange.start,
            end: newRange.to?.toISOString() ?? dateRange.end,
          },
          compareRange: compareDateRange,
        };
        const url = new URL(window.location.href);
        url.searchParams.set('q', btoa(JSON.stringify(newParams)));
        // window.history.replaceState({}, '', url.toString());
        // Trigger a page reload to update the data
        // window.location.reload();
      },
      onClear: () => {
        // Clear date range filter
        const newParams = {
          range: dateRange,
          compareRange: null,
        };
        const url = new URL(window.location.href);
        url.searchParams.set('q', btoa(JSON.stringify(newParams)));
        window.history.replaceState({}, '', url.toString());
        // window.location.reload();
      },
    },
  ];

  // Add comparison date range filter if it exists
  if (compareDateRange) {
    filters.push({
      type: 'date-range-popover' as const,
      name: 'compareDateRange',
      placeholder: 'Select comparison date range',
      selectedValue: {
        from: new Date(compareDateRange.start),
        to: new Date(compareDateRange.end),
      },
      dateRange: {
        from: new Date(compareDateRange.start),
        to: new Date(compareDateRange.end),
      },
      onChange: (newRange: DateRange) => {
        // Update URL params when comparison date range changes
        const newParams = {
          range: dateRange,
          compareRange: {
            start: newRange.from?.toISOString() ?? compareDateRange.start,
            end: newRange.to?.toISOString() ?? compareDateRange.end,
          },
        };
        const url = new URL(window.location.href);
        url.searchParams.set('q', btoa(JSON.stringify(newParams)));
        window.history.replaceState({}, '', url.toString());
        window.location.reload();
      },
      onClear: () => {
        // Clear comparison date range filter
        const newParams = {
          range: dateRange,
          compareRange: null,
        };
        const url = new URL(window.location.href);
        url.searchParams.set('q', btoa(JSON.stringify(newParams)));
        window.history.replaceState({}, '', url.toString());
        window.location.reload();
      },
    });
  }

  return (
    <div className="max-w-6xl p-v2-lg">
      <div className="flex flex-row gap-v2-md mb-v2-lg">
        <div className="flex flex-row gap-v2-sm items-center">
          <FiltersBar filters={filters} />
        </div>
      </div>
      <Decisions
        data={decisionsData as DecisionOutcomesPerPeriod}
        scenarioVersions={scenarioVersions}
      />
    </div>
  );
}

export function ErrorBoundary() {
  const error = useRouteError();
  captureRemixErrorBoundaryError(error);

  //TODO: handle 404 error if needed but it should not occur

  return <ErrorComponent error={error} />;
}

export function shouldRevalidate({
  currentParams,
  nextParams,
  currentUrl,
  nextUrl,
}: {
  currentParams: any;
  nextParams: any;
  currentUrl: URL;
  nextUrl: URL;
}) {
  // Always return false to prevent full page re-renders
  // Query invalidation is handled in the component's useEffect
  return false;
}
