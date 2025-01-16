import { ErrorComponent, Page } from '@app-builder/components';
import { isAnalyticsAvailable } from '@app-builder/services/feature-access';
import { serverServices } from '@app-builder/services/init.server';
import { notFound } from '@app-builder/utils/http/http-responses';
import { getRoute } from '@app-builder/utils/routes';
import { json, type LoaderFunctionArgs, redirect } from '@remix-run/node';
import { useLoaderData, useRouteError } from '@remix-run/react';
import { captureRemixErrorBoundaryError } from '@sentry/remix';
import { type Namespace } from 'i18next';
import { useTranslation } from 'react-i18next';
import { Icon } from 'ui-icons';

export const handle = {
  i18n: ['navigation', 'data'] satisfies Namespace,
};

export async function loader({ request }: LoaderFunctionArgs) {
  const { authService } = serverServices;
  const { user, analytics, entitlements } = await authService.isAuthenticated(
    request,
    { failureRedirect: getRoute('/sign-in') },
  );

  if (!isAnalyticsAvailable(user, entitlements)) {
    return redirect(getRoute('/'));
  }

  const analyticsList = await analytics.listAnalytics();
  const globalDashbord = analyticsList.find(
    ({ embeddingType }) => embeddingType === 'global_dashboard',
  );
  if (!globalDashbord) {
    return notFound("Global dashboard doesn't exist");
  }

  return json({
    globalDashbord: {
      title: 'Global Dashboard',
      src: globalDashbord.signedEmbeddingUrl,
    },
  });
}

export default function Analytics() {
  const { t } = useTranslation(handle.i18n);
  const { globalDashbord } = useLoaderData<typeof loader>();

  return (
    <Page.Main>
      <Page.Header className="justify-between">
        <div className="flex flex-row items-center">
          <Icon icon="analytics" className="me-2 size-6" />
          <span className="line-clamp-1 text-start">
            {t('navigation:analytics')}
          </span>
        </div>
      </Page.Header>
      <iframe
        src={globalDashbord.src}
        title={globalDashbord.title}
        className="size-full"
      ></iframe>
    </Page.Main>
  );
}

export function ErrorBoundary() {
  const error = useRouteError();
  captureRemixErrorBoundaryError(error);

  //TODO: handle 404 error if needed but it should not occur

  return <ErrorComponent error={error} />;
}

export function shouldRevalidate() {
  return false;
}
