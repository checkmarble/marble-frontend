/**
 * License API
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
export type LicenseEntitlementsDto = {
    sso: boolean;
    workflows: boolean;
    analytics: boolean;
    user_roles: boolean;
    webhooks: boolean;
    rule_snoozes: boolean;
    test_run: boolean;
};
/**
 * Get the entitlements of an organization
 */
export function getEntitlements(organizationId: string, opts?: Oazapfts.RequestOpts) {
    return oazapfts.ok(oazapfts.fetchJson<{
        status: 200;
        data: LicenseEntitlementsDto;
    } | {
        status: 401;
        data: string;
    } | {
        status: 403;
        data: string;
    }>(`/entitlements/${encodeURIComponent(organizationId)}`, {
        ...opts
    }));
}
