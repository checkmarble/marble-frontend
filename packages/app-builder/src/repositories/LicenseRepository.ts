import { type LicenseApi } from '@app-builder/infra/license-api';
import {
  adaptLicenseEntitlements,
  type LicenseEntitlements,
} from '@app-builder/models/license';

export interface LicenseRepository {
  getEntitlements(organizationId: string): Promise<LicenseEntitlements>;
  isSsoEnabled(): Promise<boolean>;
}

export const makeGetLicenseRepository = () => {
  return (client: LicenseApi): LicenseRepository => ({
    getEntitlements: async (organizationId: string) => {
      //if (import.meta.env.PROD) {
      const { feature_access } = await client.getEntitlements(organizationId);
      if (!import.meta.env.PROD) {
        feature_access.webhooks = 'restricted';
        feature_access.analytics = 'restricted';
      }
      return adaptLicenseEntitlements(feature_access);
      //}
      // return Promise.resolve({
      //   sanctions: 'restricted',
      //   ruleSnoozes: 'restricted',
      //   userRoles: 'test',
      //   webhooks: 'test',
      //   analytics: 'test',
      //   workflows: 'test',
      //   testRun: 'test',
      // });
    },
    isSsoEnabled: async () => (await client.isSsoEnabled()).is_sso_enabled,
  });
};
