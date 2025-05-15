import { type FeatureAccessApi } from '@app-builder/infra/feature-access-api';
import { adaptFeatureAccesses, type FeatureAccesses } from '@app-builder/models/feature-access';

export interface FeatureAccessRepository {
  getEntitlements(): Promise<FeatureAccesses>;
}

export const makeGetFeatureAccessRepository =
  () =>
  (client: FeatureAccessApi): FeatureAccessRepository => ({
    getEntitlements: async () =>
      adaptFeatureAccesses((await client.getEntitlements()).feature_access),
  });
