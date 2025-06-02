import type { FirebaseClientWrapper } from '@app-builder/infra/firebase';

import {
  type AuthenticationClientRepository,
  getAuthenticationClientRepository,
} from './AuthenticationRepository';

export interface ClientRepositories {
  authenticationClientRepository: AuthenticationClientRepository;
}

interface MakeClientRepositoriesArgs {
  firebaseClient: FirebaseClientWrapper;
}

export function makeClientRepositories({
  firebaseClient,
}: MakeClientRepositoriesArgs): ClientRepositories {
  return {
    authenticationClientRepository: getAuthenticationClientRepository(firebaseClient),
  };
}
