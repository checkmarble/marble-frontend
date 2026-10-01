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
 * Retrieve an organization data model
 */
export function getOrganizationDataModel(organizationId: string, opts?: Oazapfts.RequestOpts) {
    return oazapfts.ok(oazapfts.fetchJson<{
        status: 200;
        data: {
            data_model: {
                tables: {
                    [key: string]: {
                        id: string;
                        name: string;
                        description: string;
                        fields: {
                            [key: string]: {
                                id: string;
                                data_type: "Bool" | "Int" | "Float" | "String" | "Timestamp" | "IpAddress" | "Coords" | "unknown";
                                description: string;
                                is_enum: boolean;
                                name: string;
                                nullable: boolean;
                                table_id: string;
                                values?: (string | number)[];
                                unicity_constraint: "no_unicity_constraint" | "pending_unique_constraint" | "active_unique_constraint";
                                ftm_property?: string;
                            };
                        };
                        links_to_single?: {
                            [key: string]: {
                                id: string;
                                parent_table_name: string;
                                parent_table_id: string;
                                parent_field_name: string;
                                parent_field_id: string;
                                child_table_name: string;
                                child_table_id: string;
                                child_field_name: string;
                                child_field_id: string;
                            };
                        };
                        navigation_options?: {
                            /** name of the table we use as a starting point to explore "many" entries from another table, by correlating fields. */
                            source_table_name: string;
                            source_table_id: string;
                            /** name of the field whose value we use as a filter on this object. */
                            source_field_name: string;
                            source_field_id: string;
                            /** name of the table for which we explore "many" entries from a reference object. May be the same as the parent table. */
                            target_table_name: string;
                            target_table_id: string;
                            /** name of the field on which to filter the target table (on the "many" side of the relation) */
                            filter_field_name: string;
                            filter_field_id: string;
                            /** name of the field on which to order the target table (on the "many" side of the relation) */
                            ordering_field_name: string;
                            ordering_field_id: string;
                            /** status of the index that is created in the database to allow data exploration on the child table. */
                            status: "pending" | "valid" | "invalid";
                        }[];
                        ftm_entity?: "Person" | "Company" | "Organization" | "Vessel" | "Airplane";
                        metadata?: {
                            [key: string]: any;
                        } | null;
                        /** Name of the field used as default ordering */
                        primary_ordering_field?: string;
                    };
                };
            };
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
    }>(`/data-model${QS.query(QS.explode({
        "organization-id": organizationId
    }))}`, {
        ...opts
    }));
}
/**
 * Retrieve an organization client object
 */
export function getOrganizationClientObject(organizationId: string, tableName: string, objectId: string, opts?: Oazapfts.RequestOpts) {
    return oazapfts.ok(oazapfts.fetchJson<{
        status: 200;
        data: {
            data: {
                [key: string]: any;
            };
            metadata: {
                valid_from: string;
            };
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
    }>(`/client_data/${encodeURIComponent(tableName)}/${encodeURIComponent(objectId)}${QS.query(QS.explode({
        "organization-id": organizationId
    }))}`, {
        ...opts
    }));
}
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
