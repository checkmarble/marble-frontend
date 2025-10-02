import { type FirebaseClientWrapper } from '@app-builder/infra/firebase';
import { AppConfig } from '@app-builder/models/app-config';
import {
  type AuthenticationClientRepository,
  getAuthenticationClientRepository,
} from './AuthenticationRepository';

export interface ClientRepositories {
  authenticationClientRepository: AuthenticationClientRepository;
}

interface MakeClientRepositoriesArgs {
  appConfig: AppConfig;
  firebaseClient: FirebaseClientWrapper;
}

export function makeClientRepositories({
  appConfig,
  firebaseClient,
}: MakeClientRepositoriesArgs): ClientRepositories {
  return {
    authenticationClientRepository: getAuthenticationClientRepository(appConfig, firebaseClient),
  };
}
