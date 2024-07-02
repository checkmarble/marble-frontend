import { type TransferAlert } from '@app-builder/models/transfer-alert';
import { createSimpleContext } from '@app-builder/utils/create-context';
import * as React from 'react';

interface AlertContext {
  receivedAlerts: TransferAlert[];
  sentAlerts: TransferAlert[];
}

const AlertsContext = createSimpleContext<AlertContext>('AlertsContext');

export function AlertsContextProvider({
  alerts,
  children,
}: {
  alerts: TransferAlert[];
  children: React.ReactNode;
}) {
  const value = React.useMemo(
    () => ({
      receivedAlerts: alerts.filter((alert) => alert.type === 'received'),
      sentAlerts: alerts.filter((alert) => alert.type === 'sent'),
    }),
    [alerts],
  );

  return (
    <AlertsContext.Provider value={value}>{children}</AlertsContext.Provider>
  );
}

export const useReceivedAlerts = () => AlertsContext.useValue().receivedAlerts;
export const useSentAlerts = () => AlertsContext.useValue().sentAlerts;
