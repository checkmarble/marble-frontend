import { type FeatureAccessApi } from '@app-builder/infra/feature-access-api';
import {
  adaptFeatureAccesses,
  emptyFeatureAccesses,
  type FeatureAccesses,
} from '@app-builder/models/feature-access';

export interface FeatureAccessRepository {
  getEntitlements(organizationId?: string): Promise<FeatureAccesses>;
  isSsoEnabled(): Promise<boolean>;
}

export const makeGetFeatureAccessRepository =
  () =>
  (client: FeatureAccessApi): FeatureAccessRepository => ({
    isSsoEnabled: async () => (await client.isSsoEnabled()).is_sso_enabled,
    getEntitlements: async (organizationId) =>
      organizationId
        ? adaptFeatureAccesses((await client.getEntitlements(organizationId)).feature_access)
        : emptyFeatureAccesses(),
  });
