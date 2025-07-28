import type { CurrentUser } from '@app-builder/models';
import { requestCache } from '@app-builder/utils/request-cache';
import type { UserRepository } from './UserRepository';

export function createCachedUserRepository(repository: UserRepository): UserRepository {
  return {
    ...repository,
    getCurrentUser: async (): Promise<CurrentUser> => {
      return requestCache.get(
        'getCurrentUser',
        () => repository.getCurrentUser(),
        10000, // Cache for 10 seconds
      );
    },
  };
}
