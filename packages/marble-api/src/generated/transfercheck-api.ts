/**
 * Transfercheck API
 * 1.0.0
 * DO NOT MODIFY - This file has been generated using oazapfts.
 * See https://www.npmjs.com/package/oazapfts
 */
import * as Oazapfts from '@oazapfts/runtime';
import * as QS from '@oazapfts/runtime/query';
export const defaults: Oazapfts.Defaults<Oazapfts.CustomHeaders> = {
  headers: {},
  baseUrl: 'http://localhost:8080',
};
const oazapfts = Oazapfts.runtime(defaults);
export const servers = {
  localDevlopmentServer: 'http://localhost:8080',
};
export type PartnerDto = {
  id: string;
  created_at: string;
  name: string;
};
export type Token = {
  access_token: string;
  token_type: string;
  expires_at: string;
};
export type CredentialsDto = {
  credentials: {
    organization_id: string;
    partner_id?: string;
    role: string;
    actor_identity: {
      user_id?: string;
      email?: string;
      first_name?: string;
      last_name?: string;
      api_key_name?: string;
    };
    permissions: string[];
  };
};
export type TransferStatusDto = 'neutral' | 'suspected_fraud' | 'confirmed_fraud';
export type TransferDataDto = {
  beneficiary_bic: string;
  beneficiary_iban: string;
  beneficiary_name: string;
  created_at: string;
  currency: string;
  label: string;
  sender_account_id: string;
  sender_account_type: 'physical_person' | 'moral_person';
  sender_bic: string;
  sender_device: string;
  sender_ip: string;
  status: TransferStatusDto;
  timezone: string;
  transfer_id: string;
  transfer_requested_at: string;
  updated_at: string;
  value: number;
};
export type TransferDto = {
  id: string;
  last_scored_at?: string | null;
  score?: number | null;
  beneficiary_in_network: boolean;
  transfer_data: TransferDataDto;
};
export type TransferUpdateBodyDto = {
  status: TransferStatusDto;
};
export type TransferAlertCreateBodyDto = {
  transfer_id: string;
  message: string;
  transfer_end_to_end_id: string;
  /** in clear, not hashed */
  beneficiary_iban: string;
  /** in clear, not hashed or pseudonimized */
  sender_iban: string;
};
export type TransferAlertStatusDto = 'pending' | 'acknowledged' | 'archived';
export type TransferAlertSenderDto = {
  id: string;
  transfer_id: string;
  sender_partner_id: string;
  created_at: string;
  status: TransferAlertStatusDto;
  message: string;
  transfer_end_to_end_id: string;
  /** in clear, not hashed */
  beneficiary_iban: string;
  /** in clear, not hashed or pseudonimized */
  sender_iban: string;
};
export type TransferAlertUpdateAsSenderBodyDto = {
  message?: string;
  transfer_end_to_end_id?: string;
  /** in clear, not hashed */
  beneficiary_iban?: string;
  /** in clear, not hashed or pseudonimized */
  sender_iban?: string;
};
export type TransferAlertBeneficiaryDto = {
  id: string;
  beneficiary_partner_id: string;
  created_at: string;
  status: TransferAlertStatusDto;
  message: string;
  transfer_end_to_end_id: string;
  /** in clear, not hashed */
  beneficiary_iban: string;
  /** in clear, not hashed or pseudonimized */
  sender_iban: string;
};
export type TransferAlertUpdateAsBeneficiaryBodyDto = {
  status: TransferAlertStatusDto;
};
/**
 * Get a partner
 */
export function getPartner(partnerId: string, opts?: Oazapfts.RequestOpts) {
  return oazapfts.ok(
    oazapfts.fetchJson<
      | {
          status: 200;
          data: {
            partner: PartnerDto;
          };
        }
      | {
          status: 401;
          data: string;
        }
      | {
          status: 403;
          data: string;
        }
      | {
          status: 404;
          data: string;
        }
    >(`/partners/${encodeURIComponent(partnerId)}`, {
      ...opts,
    }),
  );
}
/**
 * Get an access token
 */
export function postToken(
  {
    xApiKey,
    authorization,
  }: {
    xApiKey?: string;
    authorization?: string;
  } = {},
  opts?: Oazapfts.RequestOpts,
) {
  return oazapfts.ok(
    oazapfts.fetchJson<
      | {
          status: 200;
          data: Token;
        }
      | {
          status: 401;
          data: string;
        }
    >('/token', {
      ...opts,
      method: 'POST',
      headers: oazapfts.mergeHeaders(opts?.headers, {
        'X-API-Key': xApiKey,
        Authorization: authorization,
      }),
    }),
  );
}
/**
 * Get user credentials included in the token
 */
export function getCredentials(opts?: Oazapfts.RequestOpts) {
  return oazapfts.ok(
    oazapfts.fetchJson<
      | {
          status: 200;
          data: CredentialsDto;
        }
      | {
          status: 401;
          data: string;
        }
      | {
          status: 403;
          data: string;
        }
    >('/credentials', {
      ...opts,
    }),
  );
}
/**
 * List transfers
 */
export function listTransfers(transferId: string, opts?: Oazapfts.RequestOpts) {
  return oazapfts.ok(
    oazapfts.fetchJson<
      | {
          status: 200;
          data: {
            transfers: TransferDto[];
          };
        }
      | {
          status: 401;
          data: string;
        }
      | {
          status: 403;
          data: string;
        }
      | {
          status: 404;
          data: string;
        }
    >(
      `/transfers${QS.query(
        QS.explode({
          transfer_id: transferId,
        }),
      )}`,
      {
        ...opts,
      },
    ),
  );
}
/**
 * Get a transfer by id
 */
export function getTransfer(transferId: string, opts?: Oazapfts.RequestOpts) {
  return oazapfts.ok(
    oazapfts.fetchJson<
      | {
          status: 200;
          data: {
            transfer: TransferDto;
          };
        }
      | {
          status: 401;
          data: string;
        }
      | {
          status: 403;
          data: string;
        }
      | {
          status: 404;
          data: string;
        }
    >(`/transfers/${encodeURIComponent(transferId)}`, {
      ...opts,
    }),
  );
}
/**
 * Update a transfer
 */
export function updateTransfer(
  transferId: string,
  transferUpdateBodyDto: TransferUpdateBodyDto,
  opts?: Oazapfts.RequestOpts,
) {
  return oazapfts.ok(
    oazapfts.fetchJson<
      | {
          status: 200;
          data: {
            transfer: TransferDto;
          };
        }
      | {
          status: 401;
          data: string;
        }
      | {
          status: 403;
          data: string;
        }
      | {
          status: 404;
          data: string;
        }
    >(
      `/transfers/${encodeURIComponent(transferId)}`,
      oazapfts.json({
        ...opts,
        method: 'PATCH',
        body: transferUpdateBodyDto,
      }),
    ),
  );
}
/**
 * Create an alert
 */
export function createAlert(
  transferAlertCreateBodyDto: TransferAlertCreateBodyDto,
  opts?: Oazapfts.RequestOpts,
) {
  return oazapfts.ok(
    oazapfts.fetchJson<
      | {
          status: 200;
          data: {
            alert: TransferAlertSenderDto;
          };
        }
      | {
          status: 401;
          data: string;
        }
      | {
          status: 403;
          data: string;
        }
      | {
          status: 404;
          data: string;
        }
    >(
      '/transfer/alerts',
      oazapfts.json({
        ...opts,
        method: 'POST',
        body: transferAlertCreateBodyDto,
      }),
    ),
  );
}
/**
 * List sent alerts
 */
export function listSentAlerts(
  {
    transferId,
  }: {
    transferId?: string;
  } = {},
  opts?: Oazapfts.RequestOpts,
) {
  return oazapfts.ok(
    oazapfts.fetchJson<
      | {
          status: 200;
          data: {
            alerts: TransferAlertSenderDto[];
          };
        }
      | {
          status: 401;
          data: string;
        }
      | {
          status: 403;
          data: string;
        }
      | {
          status: 404;
          data: string;
        }
    >(
      `/transfer/sent/alerts${QS.query(
        QS.explode({
          transfer_id: transferId,
        }),
      )}`,
      {
        ...opts,
      },
    ),
  );
}
/**
 * Get a sent alert by id
 */
export function getSentAlert(alertId: string, opts?: Oazapfts.RequestOpts) {
  return oazapfts.ok(
    oazapfts.fetchJson<
      | {
          status: 200;
          data: {
            alert: TransferAlertSenderDto;
          };
        }
      | {
          status: 401;
          data: string;
        }
      | {
          status: 403;
          data: string;
        }
      | {
          status: 404;
          data: string;
        }
    >(`/transfer/sent/alerts/${encodeURIComponent(alertId)}`, {
      ...opts,
    }),
  );
}
/**
 * Update a sent alert
 */
export function updateSentAlert(
  alertId: string,
  transferAlertUpdateAsSenderBodyDto: TransferAlertUpdateAsSenderBodyDto,
  opts?: Oazapfts.RequestOpts,
) {
  return oazapfts.ok(
    oazapfts.fetchJson<
      | {
          status: 200;
          data: {
            alert: TransferAlertSenderDto;
          };
        }
      | {
          status: 401;
          data: string;
        }
      | {
          status: 403;
          data: string;
        }
      | {
          status: 404;
          data: string;
        }
    >(
      `/transfer/sent/alerts/${encodeURIComponent(alertId)}`,
      oazapfts.json({
        ...opts,
        method: 'PATCH',
        body: transferAlertUpdateAsSenderBodyDto,
      }),
    ),
  );
}
/**
 * List received alerts
 */
export function listReceivedAlerts(
  {
    transferId,
  }: {
    transferId?: string;
  } = {},
  opts?: Oazapfts.RequestOpts,
) {
  return oazapfts.ok(
    oazapfts.fetchJson<
      | {
          status: 200;
          data: {
            alerts: TransferAlertBeneficiaryDto[];
          };
        }
      | {
          status: 401;
          data: string;
        }
      | {
          status: 403;
          data: string;
        }
      | {
          status: 404;
          data: string;
        }
    >(
      `/transfer/received/alerts${QS.query(
        QS.explode({
          transfer_id: transferId,
        }),
      )}`,
      {
        ...opts,
      },
    ),
  );
}
/**
 * Get a received alert by id
 */
export function getReceivedAlert(alertId: string, opts?: Oazapfts.RequestOpts) {
  return oazapfts.ok(
    oazapfts.fetchJson<
      | {
          status: 200;
          data: {
            alert: TransferAlertBeneficiaryDto;
          };
        }
      | {
          status: 401;
          data: string;
        }
      | {
          status: 403;
          data: string;
        }
      | {
          status: 404;
          data: string;
        }
    >(`/transfer/received/alerts/${encodeURIComponent(alertId)}`, {
      ...opts,
    }),
  );
}
/**
 * Update a received alert
 */
export function updateReceivedAlert(
  alertId: string,
  transferAlertUpdateAsBeneficiaryBodyDto: TransferAlertUpdateAsBeneficiaryBodyDto,
  opts?: Oazapfts.RequestOpts,
) {
  return oazapfts.ok(
    oazapfts.fetchJson<
      | {
          status: 200;
          data: {
            alert: TransferAlertBeneficiaryDto;
          };
        }
      | {
          status: 401;
          data: string;
        }
      | {
          status: 403;
          data: string;
        }
      | {
          status: 404;
          data: string;
        }
    >(
      `/transfer/received/alerts/${encodeURIComponent(alertId)}`,
      oazapfts.json({
        ...opts,
        method: 'PATCH',
        body: transferAlertUpdateAsBeneficiaryBodyDto,
      }),
    ),
  );
}
