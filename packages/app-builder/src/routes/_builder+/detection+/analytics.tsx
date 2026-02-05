import { ErrorComponent, Page } from '@app-builder/components';
import { BreadCrumbs } from '@app-builder/components/Breadcrumbs';
import { DetectionNavigationTabs } from '@app-builder/components/Detection';
import { isAnalyticsAvailable } from '@app-builder/services/feature-access';
import { initServerServices } from '@app-builder/services/init.server';
import { getRoute } from '@app-builder/utils/routes';
import { fromUUIDtoSUUID } from '@app-builder/utils/short-uuid';
import { type LoaderFunctionArgs, redirect } from '@remix-run/node';
import { Link, Outlet, useRouteError } from '@remix-run/react';
import { captureRemixErrorBoundaryError } from '@sentry/remix';
import { type Namespace } from 'i18next';
import { useTranslation } from 'react-i18next';
import { Icon } from 'ui-icons';

export const handle = {
  i18n: ['navigation', 'analytics'] satisfies Namespace,
};

export async function loader({ request }: LoaderFunctionArgs) {
  const { authService } = initServerServices(request);
  const { user, entitlements, scenario } = await authService.isAuthenticated(request, {
    failureRedirect: getRoute('/sign-in'),
  });

  if (!isAnalyticsAvailable(user, entitlements)) {
    return redirect(getRoute('/detection'));
  }

  // Redirect to the first scenario's analytics
  const scenarios = await scenario.listScenarios();
  const firstScenario = scenarios[0];

  if (firstScenario) {
    return redirect(
      getRoute('/analytics/:scenarioId', {
        scenarioId: fromUUIDtoSUUID(firstScenario.id),
      }),
    );
  }

  // If no scenarios, redirect to scenarios page
  return redirect(getRoute('/detection/scenarios'));
}

export default function DetectionAnalyticsPage() {
  const { t } = useTranslation(handle.i18n);

  return (
    <Page.Main className="bg-grey-background-light">
      <Page.Header className="justify-between">
        <BreadCrumbs />
        <Link
          to={getRoute('/analytics-legacy')}
          target="_blank"
          className="text-s text-grey-secondary flex flex-row items-center font-semibold gap-v2-xs"
        >
          <Icon icon="openinnew" className="size-4" />
          <span>{t('analytics:legacy-analytics-link')}</span>
        </Link>
      </Page.Header>
      <Page.Container>
        <Page.ContentV2 className="gap-v2-md">
          <DetectionNavigationTabs />
          <Outlet />
        </Page.ContentV2>
      </Page.Container>
    </Page.Main>
  );
}

export function ErrorBoundary() {
  const error = useRouteError();
  captureRemixErrorBoundaryError(error);
  return <ErrorComponent error={error} />;
}
