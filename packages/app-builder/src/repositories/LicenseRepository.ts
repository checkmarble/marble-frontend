import { type MarbleApi } from '@app-builder/infra/marble-api';
import { type LicenseValidation } from '@app-builder/models/license';

export interface LicenseRepository {
  validateLicenseKey(licenseKey: string): Promise<LicenseValidation>;
}

export function getLicenseRepository(_: MarbleApi): LicenseRepository {
  return {
    validateLicenseKey: async () => {
      return Promise.resolve({
        code: 'NOT_FOUND',
        entitlements: {
          sso: true,
          workflows: true,
          analytics: true,
          dataEnrichment: true,
          userRoles: true,
        },
      });
    },
  };
}
