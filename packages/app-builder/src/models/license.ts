import {
  type FeatureAccessDto,
  type LicenseEntitlementsDto,
} from 'marble-api/generated/license-api';

export interface LicenseEntitlements {
  workflows: FeatureAccessDto;
  analytics: FeatureAccessDto;
  userRoles: FeatureAccessDto;
  webhooks: FeatureAccessDto;
  ruleSnoozes: FeatureAccessDto;
  testRun: FeatureAccessDto;
  sanctions: FeatureAccessDto;
}

export function adaptLicenseEntitlements(
  dto: LicenseEntitlementsDto,
): LicenseEntitlements {
  return {
    /**
     * When adding a new entitlement, there is a "chicken egg" problem.
     * In non dev environments, the entitlements are fetched from the backend.
     * Existing licenses do not have the new entitlement yet, so the backend does not return it (requires a migration on existing licenses).
     * It results in the entitlement being "false" (undefined is coerced to false).
     *
     * To solve this, adapt the dto to the new entitlement using an existing one (ex: dto.license_entitlements.webhooks)
     * At the moment, any existing license has all entitlements set to true, so using an existing one as a fallback is not a problem.
     */
    workflows: dto.workflows,
    analytics: dto.analytics,
    userRoles: dto.roles,
    webhooks: dto.webhooks,
    ruleSnoozes: dto.webhooks,
    testRun: dto.test_run,
    sanctions: dto.sanctions,
  };
}
