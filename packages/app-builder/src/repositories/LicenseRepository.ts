import { type LicenseApi } from '@app-builder/infra/license-api';
import {
  adaptLicenseEntitlements,
  emptyLicenseEntitlements,
  type LicenseEntitlements,
} from '@app-builder/models/license';

export interface LicenseRepository {
  getEntitlements(organizationId?: string): Promise<LicenseEntitlements>;
  isSsoEnabled(): Promise<boolean>;
}

export const makeGetLicenseRepository =
  () =>
  (client: LicenseApi): LicenseRepository => ({
    getEntitlements: async (organizationId) => {
      return organizationId
        ? adaptLicenseEntitlements(
            (await client.getEntitlements(organizationId)).feature_access,
          )
        : emptyLicenseEntitlements();
    },
    isSsoEnabled: async () => (await client.isSsoEnabled()).is_sso_enabled,
  });
