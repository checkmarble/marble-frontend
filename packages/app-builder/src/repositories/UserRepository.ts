import { type MarbleApi } from '@app-builder/infra/marble-api';
import { adaptUser } from '@app-builder/models/user';

export type UserRepository = ReturnType<typeof getUserRepository>;

export function getUserRepository() {
  return (marbleApiClient: MarbleApi) => ({
    getCurrentUser: async () => {
      const { credentials } = await marbleApiClient.getCredentials();

      return adaptUser(credentials);
    },
  });
}
