import { type LicenseEntitlements } from '@app-builder/models/license';
import { type LicenseRepository } from '@app-builder/repositories/LicenseRepository';

// Shared state accross each instance of the service
const licenseEntitlementsMap = new Map<string, Promise<LicenseEntitlements>>();

export function makeLicenseServerService({
  licenseKey,
  licenseRepository,
}: {
  licenseKey: string;
  licenseRepository: LicenseRepository;
}) {
  let licenseEntitlements = licenseEntitlementsMap.get(licenseKey);
  if (!licenseEntitlements) {
    licenseEntitlements = licenseRepository
      .validateLicenseKey(licenseKey)
      .then(({ code, entitlements }) => {
        if (code === 'VALID') return entitlements;
        return {
          sso: false,
          workflows: false,
          analytics: false,
          dataEnrichment: false,
          userRoles: false,
        };
      });

    licenseEntitlementsMap.set(licenseKey, licenseEntitlements);
  }

  return {
    getLicenseEntitlements: async (): Promise<LicenseEntitlements> => {
      return licenseEntitlements;
    },
  };
}
