import { AlertsList } from '@app-builder/components/TransferAlerts/AlertsList';
import { initServerServices } from '@app-builder/services/init.server';
import { getRoute } from '@app-builder/utils/routes';
import { fromUUIDtoSUUID } from '@app-builder/utils/short-uuid';
import { type LoaderFunctionArgs } from '@remix-run/node';
import { json, Link, useLoaderData } from '@remix-run/react';

export async function loader({ request }: LoaderFunctionArgs) {
  const { authService } = initServerServices(request);
  const { transferAlertRepository } = await authService.isAuthenticated(request, {
    failureRedirect: getRoute('/sign-in'),
  });

  const alerts = await transferAlertRepository.listReceivedAlerts();

  return json({ alerts });
}

export default function ReceivedAlertsPage() {
  const { alerts } = useLoaderData<typeof loader>();

  return (
    <AlertsList
      alerts={alerts}
      className="max-h-[60dvh]"
      rowLink={(alertId) => (
        <Link
          to={getRoute('/transfercheck/alerts/received/:alertId', {
            alertId: fromUUIDtoSUUID(alertId),
          })}
        />
      )}
    />
  );
}
