import { ErrorComponent } from '@app-builder/components';
import { Decisions } from '@app-builder/components/Analytics/Decisions';
import { Filters } from '@app-builder/components/Analytics/Filters';
import { BreadCrumbLink, type BreadCrumbProps } from '@app-builder/components/Breadcrumbs';
import { type DecisionOutcomesPerPeriod } from '@app-builder/models/analytics';
import { useGetDecisionsOutcomesPerDay } from '@app-builder/queries/analytics/get-decisions-outcomes-per-day';
import { initServerServices } from '@app-builder/services/init.server';
import { getRoute } from '@app-builder/utils/routes';
import { fromParams, fromUUIDtoSUUID, useParam } from '@app-builder/utils/short-uuid';
import { type LoaderFunctionArgs, redirect } from '@remix-run/node';
import { useLoaderData, useNavigate, useRouteError, useSearchParams } from '@remix-run/react';
import { captureRemixErrorBoundaryError } from '@sentry/remix';
import { useQueryClient } from '@tanstack/react-query';
import { subMonths } from 'date-fns';
import { type Namespace } from 'i18next';
import { useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
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

export async function loader({ request, params }: LoaderFunctionArgs) {
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
  const { scenarios, scenarioVersions } = useLoaderData<typeof loader>();
  const scenarioId = useParam('scenarioId');
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const queryClient = useQueryClient();

  // Parse URL params in the component to make it reactive to URL changes
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

  // Invalidate query when URL search params or scenario changes
  const prevSearchParamsRef = useRef<string>('');
  const prevScenarioIdRef = useRef<string>('');

  useEffect(() => {
    const currentSearchParams = searchParams.toString();
    const searchParamsChanged =
      prevSearchParamsRef.current && prevSearchParamsRef.current !== currentSearchParams;
    const scenarioChanged = prevScenarioIdRef.current && prevScenarioIdRef.current !== scenarioId;

    if (searchParamsChanged || scenarioChanged) {
      // Invalidate all analytics queries when scenario or search params change
      queryClient.invalidateQueries({
        queryKey: ['analytics', 'decisions'],
      });

      // Also invalidate the specific scenario query to ensure fresh data
      if (scenarioChanged) {
        queryClient.invalidateQueries({
          queryKey: ['analytics', 'decisions', scenarioId],
        });
      }
    }

    prevSearchParamsRef.current = currentSearchParams;
    prevScenarioIdRef.current = scenarioId;
  }, [searchParams, queryClient, scenarioId]);

  const onScenariochange = (scenarioId: string) => {
    const qs = searchParams.toString();
    const path = getRoute('/analytics/:scenarioId', { scenarioId: fromUUIDtoSUUID(scenarioId) });
    navigate(qs ? `${path}?${qs}` : path);
  };

  return (
    <div className="max-w-6xl p-v2-lg">
      <div className="flex flex-row gap-v2-md mb-v2-lg">
        <div className="flex flex-row gap-v2-sm items-center">
          <Filters
            scenarios={scenarios}
            selectedScenarioId={scenarioId}
            onSelectedScenarioIdChange={onScenariochange}
          />
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
