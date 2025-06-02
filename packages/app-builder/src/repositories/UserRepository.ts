import type { MarbleCoreApi } from '@app-builder/infra/marblecore-api';
import { adaptCurrentUser, type CurrentUser } from '@app-builder/models/user';

export interface UserRepository {
  getCurrentUser(): Promise<CurrentUser>;
}

export function makeGetUserRepository() {
  return (marbleCoreApiClient: MarbleCoreApi): UserRepository => ({
    getCurrentUser: async () => {
      const { credentials } = await marbleCoreApiClient.getCredentials();

      return adaptCurrentUser(credentials);
    },
  });
}
