import { ErrorComponent } from '@app-builder/components';
import { Decisions } from '@app-builder/components/Analytics/Decisions';
import { Filters } from '@app-builder/components/Analytics/Filters';
import { BreadCrumbLink, type BreadCrumbProps } from '@app-builder/components/Breadcrumbs';
import { initServerServices } from '@app-builder/services/init.server';
import { getRoute } from '@app-builder/utils/routes';
import { fromParams, fromUUIDtoSUUID } from '@app-builder/utils/short-uuid';
import { type LoaderFunctionArgs, redirect } from '@remix-run/node';
import { useLoaderData, useNavigate, useRouteError, useSearchParams } from '@remix-run/react';
import { captureRemixErrorBoundaryError } from '@sentry/remix';
import { subMonths } from 'date-fns';
import { type Namespace } from 'i18next';
import { useTranslation } from 'react-i18next';
import { Icon } from 'ui-icons';
import z from 'zod';

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
  const { analytics, scenario } = await authService.isAuthenticated(request, {
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

  const [decisionsOutcomesPerDay, scenarios, scenarioIterations] = await Promise.all([
    analytics.getDecisionOutcomesPerDay({
      scenarioId,
      dateRange: { start: parsed.range.start, end: parsed.range.end },
      compareDateRange: parsed.compareRange
        ? { start: parsed.compareRange.start, end: parsed.compareRange.end }
        : undefined,
      trigger: [],
    }),
    scenario.listScenarios(),
    scenario.listScenarioIterations({ scenarioId }),
  ]);

  return Response.json({
    decisionsOutcomesPerDay,
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
  const { decisionsOutcomesPerDay, scenarioId, scenarios, scenarioVersions } =
    useLoaderData<typeof loader>();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

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
      <Decisions data={decisionsOutcomesPerDay} scenarioVersions={scenarioVersions} />
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
  // Revalidate when scenarioId or date range search params change
  if (currentParams.scenarioId !== nextParams.scenarioId) return true;
  const keys = ['q'] as const;
  return keys.some((k) => currentUrl.searchParams.get(k) !== nextUrl.searchParams.get(k));
}
