import { ErrorComponent, Page } from '@app-builder/components';
import { BreadCrumbs } from '@app-builder/components/Breadcrumbs';
import { isAnalyticsAvailable } from '@app-builder/services/feature-access';
import { initServerServices } from '@app-builder/services/init.server';
import { getServerEnv } from '@app-builder/utils/environment';
import { getRoute } from '@app-builder/utils/routes';
import { fromUUIDtoSUUID } from '@app-builder/utils/short-uuid';
import { type LoaderFunctionArgs, redirect } from '@remix-run/node';
import { Outlet, useRouteError } from '@remix-run/react';
import { captureRemixErrorBoundaryError } from '@sentry/remix';
import { type Namespace } from 'i18next';

export type DecisionsPerOutcome = {
  date: string;
  approve: number;
  decline: number;
  review: number;
  blockAndReview: number;
};
export const handle = {
  i18n: ['navigation', 'analytics'] satisfies Namespace,
};

export async function loader({ request, params }: LoaderFunctionArgs) {
  const { authService } = initServerServices(request);
  const { user, entitlements, scenario } = await authService.isAuthenticated(request, {
    failureRedirect: getRoute('/sign-in'),
  });

  if (!isAnalyticsAvailable(user, entitlements)) {
    return redirect(getRoute('/'));
  }

  if (!getServerEnv('ANALYTICS_V2')?.split(',').includes(user.organizationId)) {
    return redirect(getRoute('/analytics-legacy'));
  }

  if (!params['scenarioId']) {
    const scenarioId = (await scenario.listScenarios())[0]?.id ?? null;

    return redirect(
      scenarioId
        ? getRoute('/analytics/:scenarioId', {
            scenarioId: fromUUIDtoSUUID(scenarioId),
          })
        : getRoute('/scenarios'),
    );
  }
  return null;
}

export default function Analytics() {
  return (
    <Page.Main className="bg-grey-background-light">
      <Page.Header className="justify-between">
        <BreadCrumbs />
      </Page.Header>
      <Outlet />
    </Page.Main>
  );
}

export function ErrorBoundary() {
  const error = useRouteError();
  captureRemixErrorBoundaryError(error);

  //TODO: handle 404 error if needed but it should not occur

  return <ErrorComponent error={error} />;
}

export function shouldRevalidate({ currentParams, nextParams }: { currentParams: any; nextParams: any }) {
  // Revalidate when scenarioId changes
  return currentParams.scenarioId !== nextParams.scenarioId;
}
