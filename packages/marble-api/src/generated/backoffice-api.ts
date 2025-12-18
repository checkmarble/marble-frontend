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
    baseUrl: "http://localhost:8080",
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
