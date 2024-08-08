import { type LicenseValidationDto } from 'marble-api/generated/license-api';

export interface LicenseEntitlements {
  sso: boolean;
  workflows: boolean;
  analytics: boolean;
  dataEnrichment: boolean;
  userRoles: boolean;
  webhooks: boolean;
  ruleSnoozes: boolean;
}

export type LicenseValidationCode =
  | 'VALID'
  | 'EXPIRED'
  | 'NOT_FOUND'
  | 'OVERDUE'
  | 'SUSPENDED';

export interface LicenseValidation {
  code: LicenseValidationCode;
  entitlements: LicenseEntitlements;
}

export function adaptLicenseValidation(
  dto: LicenseValidationDto,
): LicenseValidation {
  return {
    code: dto.license_validation_code,

    /**
     * When adding a new entitlement, there is a "chicken egg" problem.
     * In non dev environments, the entitlements are fetched from the backend.
     * Existing licenses do not have the new entitlement yet, so the backend does not return it (requires a migration on existing licenses).
     * It results in the entitlement being "false" (undefined is coerced to false).
     *
     * To solve this, adapt the dto to the new entitlement using an existing one (ex: dto.license_entitlements.webhooks)
     * At the moment, any existing license has all entitlements set to true, so using an existing one as a fallback is not a problem.
     */
    entitlements: {
      sso: dto.license_entitlements.sso,
      workflows: dto.license_entitlements.workflows,
      analytics: dto.license_entitlements.analytics,
      dataEnrichment: dto.license_entitlements.data_enrichment,
      userRoles: dto.license_entitlements.user_roles,
      webhooks: dto.license_entitlements.webhooks,
      // TODO(ruleSnoozes): remove this line once the backend supports rule snoozing in existing license (needs a migration on existing licenses)
      ruleSnoozes: dto.license_entitlements.webhooks,
      // ruleSnoozes: dto.license_entitlements.rule_snoozes,
    },
  };
}
