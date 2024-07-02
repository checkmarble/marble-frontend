import { AlertsList } from '@app-builder/components/TransferAlerts/AlertsList';
import { useSentAlerts } from '@app-builder/services/transfercheck/alerts/alerts';

export default function SentAlertsPage() {
  const alerts = useSentAlerts();

  return <AlertsList alerts={alerts} className="max-h-[60dvh]" />;
}
