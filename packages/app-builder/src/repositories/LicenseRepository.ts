import { type FeatureAccessApi } from '@app-builder/infra/license-api';
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
  (client: FeatureAccessApi): LicenseRepository => ({
    isSsoEnabled: async () => (await client.isSsoEnabled()).is_sso_enabled,
    getEntitlements: async (organizationId) =>
      organizationId
        ? adaptLicenseEntitlements((await client.getEntitlements(organizationId)).feature_access)
        : emptyLicenseEntitlements(),
  });
