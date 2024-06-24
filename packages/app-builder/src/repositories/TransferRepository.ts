import { type MarbleApi } from '@app-builder/infra/marble-api';
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
  return (marbleApiClient: MarbleApi): TransferRepository => ({
    listTransfers: async ({ partnerTransferId }) => {
      const { transfers } =
        await marbleApiClient.listTransfers(partnerTransferId);

      return transfers.map(adaptTransfer);
    },
    getTransfer: async ({ transferId }) => {
      const { transfer } = await marbleApiClient.getTransfer(transferId);

      return adaptTransfer(transfer);
    },
    updateTransfer: async ({ transferId, transferUpdateBody }) => {
      const { transfer } = await marbleApiClient.updateTransfer(
        transferId,
        transferUpdateBody,
      );

      return adaptTransfer(transfer);
    },
  });
}
