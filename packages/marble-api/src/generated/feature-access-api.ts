/**
 * Feature access API
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
export type FeatureAccessLevelDto = "allowed" | "restricted" | "test" | "missing_configuration";
export type FeatureAccessDto = {
    workflows: FeatureAccessLevelDto;
    analytics: FeatureAccessLevelDto;
    roles: FeatureAccessLevelDto;
    webhooks: FeatureAccessLevelDto;
    rule_snoozes: FeatureAccessLevelDto;
    test_run: FeatureAccessLevelDto;
    sanctions: FeatureAccessLevelDto;
    name_recognition: FeatureAccessLevelDto;
    ai_assist: FeatureAccessLevelDto;
    auto_assignment: FeatureAccessLevelDto;
};
/**
 * Get the entitlements of an organization
 */
export function getEntitlements(opts?: Oazapfts.RequestOpts) {
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
    }>("/feature_access", {
        ...opts
    }));
}
