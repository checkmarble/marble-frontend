/**
 * Transfercheck API
 * 1.0.0
 * DO NOT MODIFY - This file has been generated using oazapfts.
 * See https://www.npmjs.com/package/oazapfts
 */
import * as Oazapfts from "@oazapfts/runtime";
import * as QS from "@oazapfts/runtime/query";
export const defaults: Oazapfts.Defaults<Oazapfts.CustomHeaders> = {
    headers: {},
    baseUrl: "http://localhost:8080",
};
const oazapfts = Oazapfts.runtime(defaults);
export const servers = {
    localDevlopmentServer: "http://localhost:8080"
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
export type TransferDataDto = {
    beneficiary_bic: string;
    beneficiary_iban: string;
    beneficiary_name: string;
    created_at: string;
    currency: string;
    label: string;
    sender_account_id: string;
    sender_bic: string;
    sender_device: string;
    sender_ip: string;
    status: "neutral" | "suspected_fraud" | "confirmed_fraud";
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
    transfer_data: TransferDataDto;
};
export type TransferUpdateBodyDto = {
    status: "neutral" | "suspected_fraud" | "confirmed_fraud";
};
/**
 * Get an access token
 */
export function postToken({ xApiKey, authorization }: {
    xApiKey?: string;
    authorization?: string;
} = {}, opts?: Oazapfts.RequestOpts) {
    return oazapfts.ok(oazapfts.fetchJson<{
        status: 200;
        data: Token;
    } | {
        status: 401;
        data: string;
    }>("/token", {
        ...opts,
        method: "POST",
        headers: oazapfts.mergeHeaders(opts?.headers, {
            "X-API-Key": xApiKey,
            Authorization: authorization
        })
    }));
}
/**
 * Get user credentials included in the token
 */
export function getCredentials(opts?: Oazapfts.RequestOpts) {
    return oazapfts.ok(oazapfts.fetchJson<{
        status: 200;
        data: CredentialsDto;
    } | {
        status: 401;
        data: string;
    } | {
        status: 403;
        data: string;
    }>("/credentials", {
        ...opts
    }));
}
/**
 * List transfers
 */
export function listTransfers(transferId: string, opts?: Oazapfts.RequestOpts) {
    return oazapfts.ok(oazapfts.fetchJson<{
        status: 200;
        data: {
            transfers: TransferDto[];
        };
    } | {
        status: 401;
        data: string;
    } | {
        status: 403;
        data: string;
    } | {
        status: 404;
        data: string;
    }>(`/transfers${QS.query(QS.explode({
        transfer_id: transferId
    }))}`, {
        ...opts
    }));
}
/**
 * Get a transfer by id
 */
export function getTransfer(transferId: string, opts?: Oazapfts.RequestOpts) {
    return oazapfts.ok(oazapfts.fetchJson<{
        status: 200;
        data: {
            transfer: TransferDto;
        };
    } | {
        status: 401;
        data: string;
    } | {
        status: 403;
        data: string;
    } | {
        status: 404;
        data: string;
    }>(`/transfers/${encodeURIComponent(transferId)}`, {
        ...opts
    }));
}
/**
 * Update a transfer
 */
export function updateTransfer(transferId: string, transferUpdateBodyDto: TransferUpdateBodyDto, opts?: Oazapfts.RequestOpts) {
    return oazapfts.ok(oazapfts.fetchJson<{
        status: 200;
        data: {
            transfer: TransferDto;
        };
    } | {
        status: 401;
        data: string;
    } | {
        status: 403;
        data: string;
    } | {
        status: 404;
        data: string;
    }>(`/transfers/${encodeURIComponent(transferId)}`, oazapfts.json({
        ...opts,
        method: "PATCH",
        body: transferUpdateBodyDto
    })));
}
