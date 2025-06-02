import type { TransfercheckApi } from '@app-builder/infra/transfercheck-api';
import {
  adaptTransfer,
  type Transfer,
  type TransferUpdateBody,
} from '@app-builder/models/transfer';

export interface TransferRepository {
  listTransfers(args: { partnerTransferId: string }): Promise<Transfer[]>;
  getTransfer(args: { transferId: string }): Promise<Transfer>;
  updateTransfer(args: {
    transferId: string;
    transferUpdateBody: TransferUpdateBody;
  }): Promise<Transfer>;
}

export function makeGetTransferRepository() {
  return (transfercheckApi: TransfercheckApi): TransferRepository => ({
    listTransfers: async ({ partnerTransferId }) => {
      const { transfers } = await transfercheckApi.listTransfers(partnerTransferId);

      return transfers.map(adaptTransfer);
    },
    getTransfer: async ({ transferId }) => {
      const { transfer } = await transfercheckApi.getTransfer(transferId);

      return adaptTransfer(transfer);
    },
    updateTransfer: async ({ transferId, transferUpdateBody }) => {
      const { transfer } = await transfercheckApi.updateTransfer(transferId, transferUpdateBody);

      return adaptTransfer(transfer);
    },
  });
}
