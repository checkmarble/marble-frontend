import { type LicenseEntitlements } from '@app-builder/models/license';
import { type LicenseRepository } from '@app-builder/repositories/LicenseRepository';

export function makeLicenseServerService({
  licenseKey,
  licenseRepository,
}: {
  licenseKey: string;
  licenseRepository: LicenseRepository;
}) {
  async function getLicenseEntitlements() {
    const { code, entitlements } =
      await licenseRepository.validateLicenseKey(licenseKey);

    if (code !== 'VALID')
      return {
        sso: false,
        workflows: false,
        analytics: false,
        dataEnrichment: false,
        userRoles: false,
      };

    return entitlements;
  }

  const entitlements = getLicenseEntitlements();

  return {
    getLicenseEntitlements: async (): Promise<LicenseEntitlements> => {
      return entitlements;
    },
  };
}
