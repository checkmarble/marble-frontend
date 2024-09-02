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
export type LicenseValidationDto = {
    license_validation_code: "VALID" | "EXPIRED" | "NOT_FOUND" | "OVERDUE" | "SUSPENDED";
    license_entitlements: {
        sso: boolean;
        workflows: boolean;
        analytics: boolean;
        data_enrichment: boolean;
        user_roles: boolean;
        webhooks: boolean;
        rule_snoozes: boolean;
    };
};
/**
 * Validate a license key
 */
export function validateLicense(licenseKey: string, opts?: Oazapfts.RequestOpts) {
    return oazapfts.ok(oazapfts.fetchJson<{
        status: 200;
        data: LicenseValidationDto;
    } | {
        status: 401;
        data: string;
    } | {
        status: 403;
        data: string;
    }>(`/validate-license/${encodeURIComponent(licenseKey)}`, {
        ...opts
    }));
}
