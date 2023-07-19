import { type FirebaseClientWrapper } from '@app-builder/infra/firebase';

import {
  type AuthenticationClientRepository,
  getAuthenticationClientRepository,
} from './AuthenticationRepository';

export interface ClientRepositories {
  authenticationClientRepositoryPromise: Promise<AuthenticationClientRepository>;
}

export function makeClientRepositories(
  firebaseClientPromise: Promise<FirebaseClientWrapper>
): ClientRepositories {
  return {
    authenticationClientRepositoryPromise: firebaseClientPromise.then(
      (firebaseClient) => getAuthenticationClientRepository(firebaseClient)
    ),
  };
}
