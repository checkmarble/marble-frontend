import { type LicenseValidationDto } from 'marble-api/generated/license-api';

export interface LicenseEntitlements {
  sso: boolean;
  workflows: boolean;
  analytics: boolean;
  dataEnrichment: boolean;
  userRoles: boolean;
  webhooks: boolean;
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
    entitlements: {
      sso: dto.license_entitlements.sso,
      workflows: dto.license_entitlements.workflows,
      analytics: dto.license_entitlements.analytics,
      dataEnrichment: dto.license_entitlements.data_enrichment,
      userRoles: dto.license_entitlements.user_roles,
      webhooks: dto.license_entitlements.webhooks,
    },
  };
}
