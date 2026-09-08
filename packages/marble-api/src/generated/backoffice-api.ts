/**
 * Backoffice API
 * 1.0.0
 * DO NOT MODIFY - This file has been generated using oazapfts.
 * See https://www.npmjs.com/package/oazapfts
 */
import * as Oazapfts from "@oazapfts/runtime";
import * as QS from "@oazapfts/runtime/query";
export const defaults: Oazapfts.Defaults<Oazapfts.CustomHeaders> = {
    headers: {},
    baseUrl: "http://localhost:8080"
};
const oazapfts = Oazapfts.runtime(defaults);
export const servers = {
    localDevelopmentServer: "http://localhost:8080"
};
export type Roles = "allowed" | "restricted" | "test" | "missing_configuration";
export type FeatureAccessDto = {
    workflows: Roles;
    analytics: Roles;
    roles: "allowed" | "restricted" | "test" | "missing_configuration";
    webhooks: Roles;
    rule_snoozes: Roles;
    test_run: Roles;
    sanctions: Roles;
    name_recognition: Roles;
    /** Deprecated feature flag. Only used for the hidden 'AI assist' modale in the case manager, do not use for other things. */
    ai_assist: Roles;
    case_auto_assign: Roles;
    case_ai_assist: Roles;
    continuous_screening: Roles;
    ai_rule_building: Roles;
    user_scoring: Roles;
    /** Entitlement for the LexisNexis screening provider. OpenSanctions is always available. */
    lexisnexis: Roles;
    /** Entitlement for graph exploration in case manager, client 360, and data-model relation configuration. */
    graph_exploration: Roles;
};
export type LicenseEntitlementsDto = {
    sso: boolean;
    workflows: boolean;
    analytics: boolean;
    data_enrichment: boolean;
    user_roles: boolean;
    webhooks: boolean;
    rule_snoozes: boolean;
    test_run: boolean;
    sanctions: boolean;
    auto_assignment: boolean;
    case_ai_assist: boolean;
    continuous_screening: boolean;
    user_scoring: boolean;
    lexisnexis: boolean;
    graph_exploration: boolean;
};
export type LicenseDto = {
    id: string;
    key: string;
    created_at: string;
    suspended_at: string | null;
    expiration_date: string;
    organization_name: string;
    description: string;
    license_entitlements: LicenseEntitlementsDto;
};
/**
 * Retrieve organization features
 */
export function getOrganizationFeatures(organizationId: string, opts?: Oazapfts.RequestOpts) {
    return oazapfts.ok(oazapfts.fetchJson<{
        status: 200;
        data: {
            feature_access: FeatureAccessDto;
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
/**
 * Update organization features
 */
export function patchOrganizationFeatures(organizationId: string, body?: {
    [key: string]: "allowed" | "test" | "restricted";
}, opts?: Oazapfts.RequestOpts) {
    return oazapfts.ok(oazapfts.fetchJson<{
        status: 204;
    } | {
        status: 401;
        data: string;
    } | {
        status: 403;
        data: string;
    }>(`/organizations/${encodeURIComponent(organizationId)}/feature_access`, oazapfts.json({
        ...opts,
        method: "PATCH",
        body
    })));
}
/**
 * Import org from JSON
 */
export function importOrganization(body?: object, opts?: Oazapfts.RequestOpts) {
    return oazapfts.ok(oazapfts.fetchJson<{
        status: 204;
    } | {
        status: 401;
        data: string;
    } | {
        status: 403;
        data: string;
    }>("/org-import", oazapfts.json({
        ...opts,
        method: "POST",
        body
    })));
}
/**
 * Retrieve licenses
 */
export function getLicenses(opts?: Oazapfts.RequestOpts) {
    return oazapfts.ok(oazapfts.fetchJson<{
        status: 200;
        data: {
            licenses: LicenseDto[];
        };
    } | {
        status: 401;
        data: string;
    } | {
        status: 403;
        data: string;
    }>("/licenses", {
        ...opts
    }));
}
/**
 * Create a license
 */
export function createLicense(body: {
    expiration_date: string;
    organization_name: string;
    description: string;
    license_entitlements: LicenseEntitlementsDto;
}, opts?: Oazapfts.RequestOpts) {
    return oazapfts.ok(oazapfts.fetchJson<{
        status: 200;
        data: {
            license: LicenseDto;
        };
    } | {
        status: 401;
        data: string;
    } | {
        status: 403;
        data: string;
    }>("/licenses", oazapfts.json({
        ...opts,
        method: "POST",
        body
    })));
}
/**
 * Update a license
 */
export function updateLicense(licenseId: string, body: {
    expiration_date: string;
    organization_name: string;
    description: string;
    license_entitlements: LicenseEntitlementsDto;
    suspend?: boolean;
}, opts?: Oazapfts.RequestOpts) {
    return oazapfts.ok(oazapfts.fetchJson<{
        status: 200;
        data: {
            license: LicenseDto;
        };
    } | {
        status: 401;
        data: string;
    } | {
        status: 403;
        data: string;
    }>(`/licenses/${encodeURIComponent(licenseId)}`, oazapfts.json({
        ...opts,
        method: "PATCH",
        body
    })));
}
