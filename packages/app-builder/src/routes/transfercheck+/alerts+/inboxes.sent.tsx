import { AlertsList } from '@app-builder/components/TransferAlerts/AlertsList';
import { useSentAlerts } from '@app-builder/services/transfercheck/alerts/alerts';
import { getRoute } from '@app-builder/utils/routes';
import { fromUUID } from '@app-builder/utils/short-uuid';
import { Link } from '@remix-run/react';

export default function SentAlertsPage() {
  const alerts = useSentAlerts();

  return (
    <AlertsList
      alerts={alerts}
      className="max-h-[60dvh]"
      rowLink={(alert) => (
        <Link
          to={getRoute('/transfercheck/alerts/sent/:alertId', {
            alertId: fromUUID(alert.id),
          })}
        />
      )}
    />
  );
}
