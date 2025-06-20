import { AppConfigContext } from '@app-builder/contexts/AppConfigContext';
import { initializeFirebaseClient } from '@app-builder/infra/firebase';
import {
  type ClientRepositories,
  makeClientRepositories,
} from '@app-builder/repositories/init.client';
import { useMemo } from 'react';

import { makeAuthenticationClientService } from './auth/auth.client';
import { makeI18nextClientService } from './i18n/i18next.client';

function makeClientServices(repositories: ClientRepositories) {
  return {
    authenticationClientService: makeAuthenticationClientService(
      repositories.authenticationClientRepository,
    ),
  };
}

export function useClientServices() {
  const appConfig = AppConfigContext.useValue();
  const clientServices = useMemo(() => {
    const firebaseClient = initializeFirebaseClient(appConfig.auth.firebase);
    const clientRepositories = makeClientRepositories({ firebaseClient });
    return makeClientServices(clientRepositories);
  }, [appConfig]);

  return clientServices;
}

export const i18nextClientService = makeI18nextClientService();
