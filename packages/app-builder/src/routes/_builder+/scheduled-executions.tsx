import {
  ErrorComponent,
  Page,
  scheduledExecutionI18n,
  ScheduledExecutionsList,
} from '@app-builder/components';
import { serverServices } from '@app-builder/services/init.server';
import { json, type LoaderFunctionArgs } from '@remix-run/node';
import { useLoaderData, useRouteError } from '@remix-run/react';
import { captureRemixErrorBoundaryError } from '@sentry/remix';
import { type Namespace } from 'i18next';
import { useTranslation } from 'react-i18next';
import { Icon } from 'ui-icons';

export const handle = {
  i18n: ['navigation', ...scheduledExecutionI18n] satisfies Namespace,
};

export async function loader({ request }: LoaderFunctionArgs) {
  const { authService } = serverServices;
  const { apiClient } = await authService.isAuthenticated(request, {
    failureRedirect: getRoute('/sign-in'),
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
        <Icon icon="scheduled-execution" className="mr-2 size-6" />
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
