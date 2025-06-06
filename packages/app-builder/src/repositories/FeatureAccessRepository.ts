import { type FeatureAccessApi } from '@app-builder/infra/feature-access-api';
import { adaptFeatureAccesses, type FeatureAccesses } from '@app-builder/models/feature-access';

export interface FeatureAccessRepository {
  getEntitlements(): Promise<FeatureAccesses>;
  isSsoEnabled(): Promise<boolean>;
}

export const makeGetFeatureAccessRepository =
  () =>
  (client: FeatureAccessApi): FeatureAccessRepository => ({
    isSsoEnabled: async () => (await client.isSsoEnabled()).is_sso_enabled,
    getEntitlements: async () =>
      adaptFeatureAccesses((await client.getEntitlements()).feature_access),
  });
