import { ScheduledExecutionsList } from '@app-builder/components';
import { serverServices } from '@app-builder/services/init.server';
import { json, type LoaderArgs } from '@remix-run/node';
import { useLoaderData } from '@remix-run/react';

export async function loader({ request }: LoaderArgs) {
  const { authService } = serverServices;
  const { apiClient } = await authService.isAuthenticated(request, {
    failureRedirect: '/login',
  });

  const scheduledExecutions = apiClient.listScheduledExecutions();

  return json({
    scheduledExecutions: (await scheduledExecutions).scheduled_executions,
  });
}

export default function ScheduledExecutionTab() {
  const { scheduledExecutions } = useLoaderData<typeof loader>();

  return <ScheduledExecutionsList scheduledExecutions={scheduledExecutions} />;
}
