import { adaptCurrency } from '@app-builder/utils/currencies';
import { type Currency } from 'dinero.js';
import {
  type TransferDataDto,
  type TransferDto,
} from 'marble-api/generated/transfercheck-api';

export const transferStatuses = [
  'neutral',
  'suspected_fraud',
  'confirmed_fraud',
] as const;
export type TransferStatus = (typeof transferStatuses)[number];

export interface TransferData {
  beneficiaryBic: string;
  beneficiaryIban: string;
  beneficiaryName: string;
  createdAt: string;
  currency: Currency<number>;
  label: string;
  senderAccountId: string;
  senderAccountType: 'physical_person' | 'moral_person';
  senderBic: string;
  senderDevice: string;
  senderIp: string;
  status: TransferStatus;
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
    currency: adaptCurrency(transferDataDto.currency),
    label: transferDataDto.label,
    senderAccountId: transferDataDto.sender_account_id,
    senderAccountType: transferDataDto.sender_account_type,
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
  beneficiaryInNetwork: boolean;
  data: TransferData;
}

export function adaptTransfer(transferDto: TransferDto): Transfer {
  return {
    id: transferDto.id,
    lastScoredAt: transferDto.last_scored_at ?? undefined,
    score: transferDto.score ?? undefined,
    beneficiaryInNetwork: transferDto.beneficiary_in_network,
    data: adaptTransferData(transferDto.transfer_data),
  };
}

export interface TransferUpdateBody {
  status: TransferStatus;
}
