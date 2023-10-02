import {
  decisionsI18n,
  ScheduledExecutionsList,
} from '@app-builder/components';
import { serverServices } from '@app-builder/services/init.server';
import { json, type LoaderArgs } from '@remix-run/node';
import { useLoaderData } from '@remix-run/react';
import { type Namespace } from 'i18next';

export const handle = {
  i18n: [...decisionsI18n] satisfies Namespace,
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

export default function ScheduledExecutionTab() {
  const { scheduledExecutions } = useLoaderData<typeof loader>();

  return <ScheduledExecutionsList scheduledExecutions={scheduledExecutions} />;
}
