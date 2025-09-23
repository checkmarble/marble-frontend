import { ErrorComponent } from '@app-builder/components';
import { Decisions } from '@app-builder/components/Analytics/Decisions';
import { Filters } from '@app-builder/components/Analytics/Filters';
import { OutcomeFilter } from '@app-builder/components/Analytics/OutcomeFilter';
import { BreadCrumbLink, type BreadCrumbProps } from '@app-builder/components/Breadcrumbs';
import { type DecisionsFilter } from '@app-builder/models/analytics';
import { initServerServices } from '@app-builder/services/init.server';
import { getRoute } from '@app-builder/utils/routes';
import { type LoaderFunctionArgs, redirect } from '@remix-run/node';
import { useLoaderData, useNavigate, useRouteError, useSearchParams } from '@remix-run/react';
import { captureRemixErrorBoundaryError } from '@sentry/remix';
import { subMonths } from 'date-fns';
import { type Namespace } from 'i18next';
import { useState } from 'react';
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
  const scenarioId = params['scenarioId']!;

  const scenarios = await scenario.listScenarios();
  const url = new URL(request.url);

  const encodeBase64Url = (value: string) =>
    Buffer.from(value, 'utf-8')
      .toString('base64')
      .replace(/\+/g, '-')
      .replace(/\//g, '_')
      .replace(/=+$/g, '');

  const decodeBase64Url = (value: string) => {
    const withPadding = value.replace(/-/g, '+').replace(/_/g, '/');
    const pad = withPadding.length % 4 ? 4 - (withPadding.length % 4) : 0;
    const padded = withPadding + '='.repeat(pad);
    return Buffer.from(padded, 'base64').toString('utf-8');
  };

  const q = url.searchParams.get('q');

  const redirectWithQ = (payload: {
    range: { start: string; end: string };
    compareRange?: { start: string; end: string } | null;
  }) => {
    const encoded = encodeBase64Url(JSON.stringify(payload));
    url.searchParams.set('q', encoded);
    url.searchParams.delete('start');
    url.searchParams.delete('end');
    url.searchParams.delete('compareStart');
    url.searchParams.delete('compareEnd');
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
      const json = decodeBase64Url(q);
      const obj = JSON.parse(json);
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
    const startDefault = subMonths(now, 1).toISOString();
    return redirectWithQ({
      range: { start: startDefault, end: now.toISOString() },
      compareRange: null,
    });
  }

  const decisionsOutcomesPerDay = await analytics.getDecisionOutcomesPerDay({
    scenarioId,
    dateRange: { start: parsed.range.start, end: parsed.range.end },
    compareDateRange: parsed.compareRange
      ? { start: parsed.compareRange.start, end: parsed.compareRange.end }
      : undefined,
    trigger: [],
  });

  return Response.json({
    decisionsOutcomesPerDay,
    scenarioId,
    scenarios,
  });
}

export default function Analytics() {
  const { decisionsOutcomesPerDay, scenarioId, scenarios } = useLoaderData<typeof loader>();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  // Decision filter default values
  const defaultDecisions: DecisionsFilter = new Map([
    ['decline', true],
    ['blockAndReview', true],
    ['review', true],
    ['approve', false],
  ]);
  const [decisions, setDecisions] = useState<DecisionsFilter>(defaultDecisions);

  return (
    <>
      <div className="flex flex-row gap-4">
        <div className="flex flex-row gap-2 items-center">
          <Filters
            scenarios={scenarios}
            selectedScenarioId={scenarioId}
            onSelectedScenarioIdChange={(scenarioId) => {
              console.log('scenarioId changed to ', scenarioId);
              const qs = searchParams.toString();
              const path = getRoute('/analytics/:scenarioId', { scenarioId });
              navigate(qs ? `${path}?${qs}` : path);
            }}
          />
        </div>
      </div>
      <Decisions
        decisionsOutcomesPerDay={decisionsOutcomesPerDay}
        decisions={decisions}
        setDecisions={setDecisions}
      />
      <div className="flex w-full max-w-5xl ml-16">
        <OutcomeFilter decisions={decisions} onChange={setDecisions} />
      </div>
    </>
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
