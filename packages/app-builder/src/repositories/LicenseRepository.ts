import { type LicenseApi } from '@app-builder/infra/license-api';
import { type LicenseEntitlements } from '@app-builder/models/license';

export interface LicenseRepository {
  getEntitlements(organizationId: string): Promise<LicenseEntitlements>;
}

export const makeGetLicenseRepository = () => {
  return (_: LicenseApi): LicenseRepository => ({
    getEntitlements: async (_: string) => {
      // const licenseEntitlementsDto =
      //   await client.getEntitlements(organizationId);
      // return adaptLicenseEntitlements(licenseEntitlementsDto);
      return Promise.resolve({
        ruleSnoozes: false,
        sso: false,
        userRoles: false,
        webhooks: false,
        analytics: true,
        testRun: false,
        workflows: false,
      });
    },
  });
};
