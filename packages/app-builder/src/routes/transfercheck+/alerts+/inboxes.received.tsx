import { AlertsList } from '@app-builder/components/TransferAlerts/AlertsList';
import { useReceivedAlerts } from '@app-builder/services/transfercheck/alerts/alerts';
import { getRoute } from '@app-builder/utils/routes';
import { fromUUID } from '@app-builder/utils/short-uuid';
import { Link } from '@remix-run/react';

export default function ReceivedAlertsPage() {
  const alerts = useReceivedAlerts();

  return (
    <AlertsList
      alerts={alerts}
      className="max-h-[60dvh]"
      rowLink={(alert) => (
        <Link
          to={getRoute('/transfercheck/alerts/received/:alertId', {
            alertId: fromUUID(alert.id),
          })}
        />
      )}
    />
  );
}
