import { AppConfigContext } from '@app-builder/contexts/AppConfigContext';
import { initializeFirebaseClient } from '@app-builder/infra/firebase';
import type { AppConfig } from '@app-builder/models/app-config';
import { type ClientRepositories, makeClientRepositories } from '@app-builder/repositories/init-client';
import { makeAuthenticationClientService } from '@app-builder/services/auth/auth-client';
import { useMemo } from 'react';
import { makeI18nextClientService } from './i18n/i18next-client';

function makeClientServices(repositories: ClientRepositories) {
  return {
    authenticationClientService: makeAuthenticationClientService(repositories.authenticationClientRepository),
  };
}

export function useClientServices() {
  const appConfig = AppConfigContext.useValue();
  return useMemo(() => initializeClientServices(appConfig), [appConfig]);
}

export function initializeClientServices(appConfig: AppConfig) {
  const firebaseClient = initializeFirebaseClient(appConfig.auth.firebase);
  const clientRepositories = makeClientRepositories({ appConfig, firebaseClient });
  return makeClientServices(clientRepositories);
}

export const i18nextClientService = makeI18nextClientService();
