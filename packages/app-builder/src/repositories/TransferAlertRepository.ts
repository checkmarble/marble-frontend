import type { TransfercheckApi } from '@app-builder/infra/transfercheck-api';
import {
  adaptTransferAlertBeneficiary,
  adaptTransferAlertCreateBodyDto,
  adaptTransferAlertSender,
  adaptTransferAlertUpdateAsSenderBodyDto,
  adaptUpdateTransferAlertAsBeneficiaryDto,
  type TransferAlertBeneficiary,
  type TransferAlertCreateBody,
  type TransferAlertSender,
  type TransferAlertUpdateAsBeneficiaryBody,
  type TransferAlertUpdateAsSenderBody,
} from '@app-builder/models/transfer-alert';

export interface TransferAlertRepository {
  createAlert(args: TransferAlertCreateBody): Promise<TransferAlertSender>;
  listSentAlerts(args?: { transferId?: string }): Promise<TransferAlertSender[]>;
  listReceivedAlerts(args?: { transferId?: string }): Promise<TransferAlertBeneficiary[]>;
  getSentAlert(args: { alertId: string }): Promise<TransferAlertSender>;
  getReceivedAlert(args: { alertId: string }): Promise<TransferAlertBeneficiary>;
  updateSentAlert(
    updateTransferAlert: TransferAlertUpdateAsSenderBody,
  ): Promise<TransferAlertSender>;
  updateReceivedAlert(
    updateTransferAlert: TransferAlertUpdateAsBeneficiaryBody,
  ): Promise<TransferAlertBeneficiary>;
}

export function makeGetTransferAlertRepository() {
  return (transfercheckApi: TransfercheckApi): TransferAlertRepository => ({
    createAlert: async (createTransferAlert) => {
      const { alert } = await transfercheckApi.createAlert(
        adaptTransferAlertCreateBodyDto(createTransferAlert),
      );

      return adaptTransferAlertSender(alert);
    },
    listSentAlerts: async (args) => {
      const { alerts } = await transfercheckApi.listSentAlerts(args ?? {});

      return alerts.map((alert) => adaptTransferAlertSender(alert));
    },
    listReceivedAlerts: async (args) => {
      const { alerts } = await transfercheckApi.listReceivedAlerts(args ?? {});

      return alerts.map((alert) => adaptTransferAlertBeneficiary(alert));
    },
    getSentAlert: async ({ alertId }) => {
      const { alert } = await transfercheckApi.getSentAlert(alertId);

      return adaptTransferAlertSender(alert);
    },
    getReceivedAlert: async ({ alertId }) => {
      const { alert } = await transfercheckApi.getReceivedAlert(alertId);

      return adaptTransferAlertBeneficiary(alert);
    },
    updateSentAlert: async (updateTransferAlert) => {
      const { alert } = await transfercheckApi.updateSentAlert(
        updateTransferAlert.alertId,
        adaptTransferAlertUpdateAsSenderBodyDto(updateTransferAlert),
      );

      return adaptTransferAlertSender(alert);
    },
    updateReceivedAlert: async (updateTransferAlert) => {
      const { alert } = await transfercheckApi.updateReceivedAlert(
        updateTransferAlert.alertId,
        adaptUpdateTransferAlertAsBeneficiaryDto(updateTransferAlert),
      );

      return adaptTransferAlertBeneficiary(alert);
    },
  });
}
