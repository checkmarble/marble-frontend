import { type LicenseApi } from '@app-builder/infra/license-api';
import {
  adaptLicenseValidation,
  type LicenseValidation,
} from '@app-builder/models/license';

export interface LicenseRepository {
  validateLicenseKey(licenseKey: string): Promise<LicenseValidation>;
}

export function getLicenseRepository(
  licenseAPIClient: LicenseApi,
  devEnvironment: boolean,
): LicenseRepository {
  return {
    validateLicenseKey: async (licenseKey: string) => {
      if (devEnvironment) {
        return Promise.resolve({
          code: 'VALID',
          entitlements: {
            sso: true,
            workflows: true,
            analytics: true,
            dataEnrichment: true,
            userRoles: true,
            webhooks: true,
            ruleSnoozing: true,
          },
        });
      }
      const licenseValidationDto =
        await licenseAPIClient.validateLicense(licenseKey);

      return adaptLicenseValidation(licenseValidationDto);
    },
  };
}
