import { AlertsList } from '@app-builder/components/TransferAlerts/AlertsList';
import { useReceivedAlerts } from '@app-builder/services/transfercheck/alerts/alerts';

export default function ReceivedAlertsPage() {
  const alerts = useReceivedAlerts();

  return <AlertsList alerts={alerts} className="max-h-[60dvh]" />;
}
