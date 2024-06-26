import { type TransfercheckApi } from '@app-builder/infra/transfercheck-api';
import {
  adaptCreateTransferAlertDto,
  adaptTransferAlert,
  adaptUpdateTransferAlertDto,
  type CreateTransferAlert,
  type TransferAlert,
  type UpdateTransferAlert,
} from '@app-builder/models/transfer-alert';
import invariant from 'tiny-invariant';

export interface TransferAlertRepository {
  listAlerts(): Promise<TransferAlert[]>;
  createAlert(args: CreateTransferAlert): Promise<TransferAlert>;
  getAlert(args: { alertId: string }): Promise<TransferAlert>;
  updateAlert(
    alertId: string,
    updateTransferAlert: UpdateTransferAlert,
  ): Promise<TransferAlert>;
}

export function makeGetTransferAlertRepository() {
  return (
    transfercheckApi: TransfercheckApi,
    // TODO: make partnerId required (need to split init.server.ts into multiple files)
    partnerId?: string,
  ): TransferAlertRepository => ({
    listAlerts: async () => {
      // TODO: make partnerId required (need to split init.server.ts into multiple files)
      invariant(partnerId, 'partnerId is required');

      const { alerts } = await transfercheckApi.listAlerts();

      return alerts.map((alert) => adaptTransferAlert(alert, partnerId));
    },
    createAlert: async (createTransferAlert) => {
      // TODO: make partnerId required (need to split init.server.ts into multiple files)
      invariant(partnerId, 'partnerId is required');

      const { alert } = await transfercheckApi.createAlert(
        adaptCreateTransferAlertDto(createTransferAlert),
      );

      return adaptTransferAlert(alert, partnerId);
    },
    getAlert: async ({ alertId }) => {
      // TODO: make partnerId required (need to split init.server.ts into multiple files)
      invariant(partnerId, 'partnerId is required');

      const { alert } = await transfercheckApi.getAlert(alertId);

      return adaptTransferAlert(alert, partnerId);
    },
    updateAlert: async (alertId, updateTransferAlert) => {
      // TODO: make partnerId required (need to split init.server.ts into multiple files)
      invariant(partnerId, 'partnerId is required');

      const { alert } = await transfercheckApi.updateAlert(
        alertId,
        adaptUpdateTransferAlertDto(updateTransferAlert),
      );

      return adaptTransferAlert(alert, partnerId);
    },
  });
}
