import type { FeatureAccesses } from '@app-builder/models/feature-access';
import { requestCache } from '@app-builder/utils/request-cache';
import type { FeatureAccessRepository } from './FeatureAccessRepository';

export function createCachedFeatureAccessRepository(
  repository: FeatureAccessRepository,
): FeatureAccessRepository {
  return {
    ...repository,
    getEntitlements: async (): Promise<FeatureAccesses> => {
      return requestCache.get(
        'getEntitlements',
        () => repository.getEntitlements(),
        15000, // Cache for 15 seconds since entitlements change less frequently
      );
    },
  };
}
