import { type LicenseApi } from '@app-builder/infra/license-api';
import {
  adaptLicenseEntitlements,
  type LicenseEntitlements,
} from '@app-builder/models/license';

export interface LicenseRepository {
  getEntitlements(organizationId?: string): Promise<LicenseEntitlements>;
  isSsoEnabled(): Promise<boolean>;
}

export const makeGetLicenseRepository =
  (isDev: boolean) =>
  (client: LicenseApi): LicenseRepository => ({
    getEntitlements: async (organizationId) => {
      const accesses: LicenseEntitlements =
        !isDev && organizationId
          ? adaptLicenseEntitlements(
              (await client.getEntitlements(organizationId)).feature_access,
            )
          : {
              sanctions: 'allowed',
              ruleSnoozes: 'allowed',
              userRoles: 'allowed',
              workflows: 'allowed',
              testRun: 'allowed',
              analytics: 'allowed',
              webhooks: 'allowed',
            };

      if (isDev) {
        accesses.analytics = 'restricted';
      }

      return accesses;
    },
    isSsoEnabled: async () => (await client.isSsoEnabled()).is_sso_enabled,
  });
