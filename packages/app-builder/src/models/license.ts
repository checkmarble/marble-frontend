import { type LicenseEntitlementsDto } from 'marble-api/generated/license-api';

export interface LicenseEntitlements {
  sso: boolean;
  workflows: boolean;
  analytics: boolean;
  userRoles: boolean;
  webhooks: boolean;
  ruleSnoozes: boolean;
  testRun: boolean;
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
    sso: dto.sso,
    workflows: dto.workflows,
    analytics: dto.analytics,
    userRoles: dto.user_roles,
    webhooks: dto.webhooks,
    ruleSnoozes: dto.webhooks,
    testRun: dto.test_run,
  };
}
