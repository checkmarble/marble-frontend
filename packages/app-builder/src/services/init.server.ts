import { initializeGetMarbleAPIClient } from '@app-builder/infra/marble-api';
import {
  makeServerRepositories,
  type ServerRepositories,
} from '@app-builder/repositories/init.server';
import { getServerEnv } from '@app-builder/utils/environment.server';

import { makeAuthenticationServerService } from './auth/auth.server';
import { makeSessionService } from './auth/session.server';
import { makeI18nextServerService } from './i18n/i18next.server';

function makeServerServices(repositories: ServerRepositories) {
  const csrfSessionService = makeSessionService(
    repositories.csrfStorageRepository.csrfStorage
  );
  const authSessionService = makeSessionService(
    repositories.authStorageRepository.authStorage
  );
  const toastSessionService = makeSessionService(
    repositories.toastStorageRepository.toastStorage
  );
  return {
    authSessionService,
    csrfSessionService,
    toastSessionService,
    authService: makeAuthenticationServerService(
      repositories.marbleAPIClient,
      repositories.userRepository,
      repositories.editorRepository,
      repositories.decisionRepository,
      repositories.caseRepository,
      repositories.organizationRepository,
      repositories.scenarioRepository,
      repositories.dataModelRepository,
      authSessionService,
      csrfSessionService
    ),
    i18nextService: makeI18nextServerService(
      repositories.authStorageRepository
    ),
  };
}

function initServerServices() {
  const getMarbleAPIClient = initializeGetMarbleAPIClient({
    baseUrl: getServerEnv('MARBLE_API_DOMAIN'),
  });
  const serverRepositories = makeServerRepositories({
    getMarbleAPIClient,
    sessionStorageRepositoryOptions: {
      maxAge: Number(getServerEnv('SESSION_MAX_AGE')),
      secrets: [getServerEnv('SESSION_SECRET')],
      secure: getServerEnv('NODE_ENV') !== 'development',
    },
  });
  return makeServerServices(serverRepositories);
}

export const serverServices = initServerServices();
