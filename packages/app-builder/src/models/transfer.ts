import {
  type TransferDataDto,
  type TransferDto,
} from 'marble-api/generated/transfercheck-api';

export interface TransferData {
  beneficiaryBic: string;
  beneficiaryIban: string;
  beneficiaryName: string;
  createdAt: string;
  currency: string;
  label: string;
  senderAccountId: string;
  senderBic: string;
  senderDevice: string;
  senderIp: string;
  status: 'neutral' | 'suspected_fraud' | 'confirmed_fraud';
  timezone: string;
  partnerTransferId: string;
  transferRequestedAt: string;
  updatedAt: string;
  value: number;
}

export function adaptTransferData(
  transferDataDto: TransferDataDto,
): TransferData {
  return {
    beneficiaryBic: transferDataDto.beneficiary_bic,
    beneficiaryIban: transferDataDto.beneficiary_iban,
    beneficiaryName: transferDataDto.beneficiary_name,
    createdAt: transferDataDto.created_at,
    currency: transferDataDto.currency,
    label: transferDataDto.label,
    senderAccountId: transferDataDto.sender_account_id,
    senderBic: transferDataDto.sender_bic,
    senderDevice: transferDataDto.sender_device,
    senderIp: transferDataDto.sender_ip,
    status: transferDataDto.status,
    timezone: transferDataDto.timezone,
    partnerTransferId: transferDataDto.transfer_id,
    transferRequestedAt: transferDataDto.transfer_requested_at,
    updatedAt: transferDataDto.updated_at,
    value: transferDataDto.value,
  };
}

export interface Transfer {
  id: string;
  lastScoredAt?: string;
  score?: number;
  data: TransferData;
}

export function adaptTransfer(transferDto: TransferDto): Transfer {
  return {
    id: transferDto.id,
    lastScoredAt: transferDto.last_scored_at ?? undefined,
    score: transferDto.score ?? undefined,
    data: adaptTransferData(transferDto.transfer_data),
  };
}

export interface TransferUpdateBody {
  status: 'neutral' | 'suspected_fraud' | 'confirmed_fraud';
}
