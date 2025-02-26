import {
  type TransferAlertBeneficiaryDto,
  type TransferAlertCreateBodyDto,
  type TransferAlertSenderDto,
  type TransferAlertUpdateAsBeneficiaryBodyDto,
  type TransferAlertUpdateAsSenderBodyDto,
} from 'marble-api/generated/transfercheck-api';
import { z } from 'zod';

export const transferAlerStatuses = ['pending', 'acknowledged', 'archived'] as const;
export const transferAlerStatusesWithoutArchived = transferAlerStatuses.filter(
  (status) => status !== 'archived',
);
export type TransferAlertStatus = (typeof transferAlerStatuses)[number];

export interface TransferAlertSender {
  id: string;
  transferId: string;
  senderPartnerId: string;
  createdAt: string;
  status: TransferAlertStatus;
  message: string;
  transferEndToEndId: string;
  beneficiaryIban: string;
  senderIban: string;
}

export function adaptTransferAlertSender(dto: TransferAlertSenderDto): TransferAlertSender {
  return {
    id: dto.id,
    transferId: dto.transfer_id,
    senderPartnerId: dto.sender_partner_id,
    createdAt: dto.created_at,
    status: dto.status,
    message: dto.message,
    transferEndToEndId: dto.transfer_end_to_end_id,
    beneficiaryIban: dto.beneficiary_iban,
    senderIban: dto.sender_iban,
  };
}

export interface TransferAlertBeneficiary {
  id: string;
  beneficiaryPartnerId: string;
  createdAt: string;
  status: TransferAlertStatus;
  message: string;
  transferEndToEndId: string;
  beneficiaryIban: string;
  senderIban: string;
}

export function adaptTransferAlertBeneficiary(
  dto: TransferAlertBeneficiaryDto,
): TransferAlertBeneficiary {
  return {
    id: dto.id,
    beneficiaryPartnerId: dto.beneficiary_partner_id,
    createdAt: dto.created_at,
    status: dto.status,
    message: dto.message,
    transferEndToEndId: dto.transfer_end_to_end_id,
    beneficiaryIban: dto.beneficiary_iban,
    senderIban: dto.sender_iban,
  };
}

export interface TransferAlertCreateBody {
  transferId: string;
  message: string;
  transferEndToEndId?: string;
  beneficiaryIban?: string;
  senderIban?: string;
}

export function adaptTransferAlertCreateBodyDto(
  createTransferAlert: TransferAlertCreateBody,
): TransferAlertCreateBodyDto {
  return {
    transfer_id: createTransferAlert.transferId,
    message: createTransferAlert.message,
    transfer_end_to_end_id: createTransferAlert.transferEndToEndId ?? '',
    beneficiary_iban: createTransferAlert.beneficiaryIban ?? '',
    sender_iban: createTransferAlert.senderIban ?? '',
  };
}

export interface TransferAlertUpdateAsSenderBody {
  alertId: string;
  message?: string;
  transferEndToEndId?: string;
  beneficiaryIban?: string;
  senderIban?: string;
}

export function adaptTransferAlertUpdateAsSenderBodyDto(
  body: TransferAlertUpdateAsSenderBody,
): TransferAlertUpdateAsSenderBodyDto {
  return {
    message: body.message ?? '',
    transfer_end_to_end_id: body.transferEndToEndId ?? '',
    beneficiary_iban: body.beneficiaryIban ?? '',
    sender_iban: body.senderIban ?? '',
  };
}

export interface TransferAlertUpdateAsBeneficiaryBody {
  alertId: string;
  status: TransferAlertStatus;
}

export function adaptUpdateTransferAlertAsBeneficiaryDto(
  body: TransferAlertUpdateAsBeneficiaryBody,
): TransferAlertUpdateAsBeneficiaryBodyDto {
  return {
    status: body.status,
  };
}

export const messageSchema = z
  .string({ required_error: 'required' })
  .max(1000, { message: 'max 1000 characters' });

export const transferEndToEndIdSchema = z.string().max(100, { message: 'max 100 characters' });

export const senderIbanSchema = z.string().max(34, { message: 'max 34 characters' });

export const beneficiaryIbanSchema = z.string().max(34, { message: 'max 34 characters' });
