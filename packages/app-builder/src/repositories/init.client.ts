import { type FirebaseClientWrapper } from '@app-builder/infra/firebase';

import {
  type AuthenticationClientRepository,
  getAuthenticationClientRepository,
} from './AuthenticationRepository';

export interface ClientRepositories {
  authenticationClientRepository: AuthenticationClientRepository;
}

export function makeClientRepositories(
  firebaseClient: FirebaseClientWrapper
): ClientRepositories {
  return {
    authenticationClientRepository:
      getAuthenticationClientRepository(firebaseClient),
  };
}
