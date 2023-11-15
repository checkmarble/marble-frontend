import {
  ErrorComponent,
  Page,
  ScheduledExecutionsList,
} from '@app-builder/components';
import { serverServices } from '@app-builder/services/init.server';
import { json, type LoaderArgs } from '@remix-run/node';
import { useLoaderData, useRouteError } from '@remix-run/react';
import { captureRemixErrorBoundaryError } from '@sentry/remix';
import { type Namespace } from 'i18next';
import { useTranslation } from 'react-i18next';
import { ScheduledExecution } from 'ui-icons';

export const handle = {
  i18n: ['navigation'] satisfies Namespace,
};

export async function loader({ request }: LoaderArgs) {
  const { authService } = serverServices;
  const { apiClient } = await authService.isAuthenticated(request, {
    failureRedirect: '/login',
  });

  const { scheduled_executions } = await apiClient.listScheduledExecutions({});

  return json({
    scheduledExecutions: scheduled_executions,
  });
}

export default function ScheduledExecutions() {
  const { t } = useTranslation(handle.i18n);
  const { scheduledExecutions } = useLoaderData<typeof loader>();

  return (
    <Page.Container>
      <Page.Header>
        <ScheduledExecution className="mr-2" height="24px" width="24px" />
        {t('navigation:scheduledExecutions')}
      </Page.Header>

      <Page.Content>
        <ScheduledExecutionsList scheduledExecutions={scheduledExecutions} />
      </Page.Content>
    </Page.Container>
  );
}

export function ErrorBoundary() {
  const error = useRouteError();
  captureRemixErrorBoundaryError(error);

  return <ErrorComponent error={error} />;
}
