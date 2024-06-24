import { type MarbleApi } from '@app-builder/infra/marble-api';
import { adaptCurrentUser, type CurrentUser } from '@app-builder/models/user';

export interface UserRepository {
  getCurrentUser(): Promise<CurrentUser>;
}

export function makeGetUserRepository() {
  return (marbleApiClient: MarbleApi): UserRepository => ({
    getCurrentUser: async () => {
      const { credentials } = await marbleApiClient.getCredentials();

      return adaptCurrentUser(credentials);
    },
  });
}
