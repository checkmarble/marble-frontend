import {
  type CreateTransferAlertDto,
  type TransferAlertDto,
  type UpdateTransferAlertDto,
} from 'marble-api/generated/transfercheck-api';

export const transferAlerStatuses = ['unread', 'read', 'archived'] as const;
export type TransferAlertStatus = (typeof transferAlerStatuses)[number];

export type TransferAlertType = 'sent' | 'received';

export interface TransferAlert {
  id: string;
  type: TransferAlertType;
  transferId: string;
  senderPartnerId: string;
  beneficiaryPartnerId: string;
  createdAt: string;
  status: TransferAlertStatus;
  message: string;
  transferEndToEndId: string;
  beneficiaryIban: string;
  senderIban: string;
}

export function adaptTransferAlert(
  dto: TransferAlertDto,
  partnerId: string,
): TransferAlert {
  let type: TransferAlertType;
  if (dto.sender_partner_id === partnerId) {
    type = 'sent';
  } else if (dto.beneficiary_partner_id === partnerId) {
    type = 'received';
  } else {
    throw new Error('Invalid partner id');
  }
  return {
    id: dto.id,
    transferId: dto.transfer_id,
    type,
    senderPartnerId: dto.sender_partner_id,
    beneficiaryPartnerId: dto.beneficiary_partner_id,
    createdAt: dto.created_at,
    status: dto.status,
    message: dto.message,
    transferEndToEndId: dto.transfer_end_to_end_id,
    beneficiaryIban: dto.beneficiary_iban,
    senderIban: dto.sender_iban,
  };
}

export interface CreateTransferAlert {
  transferId: string;
  message: string;
  transferEndToEndId: string;
  beneficiaryIban: string;
  senderIban: string;
}

export function adaptCreateTransferAlertDto(
  createTransferAlert: CreateTransferAlert,
): CreateTransferAlertDto {
  return {
    transfer_id: createTransferAlert.transferId,
    message: createTransferAlert.message,
    transfer_end_to_end_id: createTransferAlert.transferEndToEndId,
    beneficiary_iban: createTransferAlert.beneficiaryIban,
    sender_iban: createTransferAlert.senderIban,
  };
}

export type UpdateTransferAlert =
  | {
      type: 'sender';
      message: string;
      transferEndToEndId: string;
      beneficiaryIban: string;
      senderIban: string;
    }
  | {
      type: 'beneficiary';
      status: TransferAlertStatus;
    };

export function adaptUpdateTransferAlertDto(
  updateTransferAlert: UpdateTransferAlert,
): UpdateTransferAlertDto {
  if (updateTransferAlert.type === 'sender') {
    return {
      message: updateTransferAlert.message,
      transfer_end_to_end_id: updateTransferAlert.transferEndToEndId,
      beneficiary_iban: updateTransferAlert.beneficiaryIban,
      sender_iban: updateTransferAlert.senderIban,
    };
  } else {
    return {
      status: updateTransferAlert.status,
    };
  }
}
