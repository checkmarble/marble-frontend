export interface LicenseEntitlements {
  sso: boolean;
  workflows: boolean;
  analytics: boolean;
  dataEnrichment: boolean;
  userRoles: boolean;
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
