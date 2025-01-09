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
export type FeatureAccessDto = "allowed" | "restricted" | "test";
export type LicenseEntitlementsDto = {
    workflows: FeatureAccessDto;
    analytics: FeatureAccessDto;
    roles: FeatureAccessDto;
    webhooks: FeatureAccessDto;
    rule_snoozes: FeatureAccessDto;
    test_run: FeatureAccessDto;
    sanctions: FeatureAccessDto;
};
/**
 * Check if SSO is enabled
 */
export function isSsoEnabled(opts?: Oazapfts.RequestOpts) {
    return oazapfts.ok(oazapfts.fetchJson<{
        status: 200;
        data: {
            is_sso_enabled: boolean;
        };
    }>("/is-sso-available", {
        ...opts
    }));
}
/**
 * Get the entitlements of an organization
 */
export function getEntitlements(organizationId: string, opts?: Oazapfts.RequestOpts) {
    return oazapfts.ok(oazapfts.fetchJson<{
        status: 200;
        data: {
            feature_access: LicenseEntitlementsDto;
        };
    } | {
        status: 401;
        data: string;
    } | {
        status: 403;
        data: string;
    }>(`/organizations/${encodeURIComponent(organizationId)}/feature_access`, {
        ...opts
    }));
}
