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
  const sessionService = makeSessionService(
    repositories.sessionStorageRepository
  );
  return {
    sessionService,
    authService: makeAuthenticationServerService(
      repositories.marbleAPIClient,
      repositories.userRepository,
      repositories.editorRepository,
      repositories.scenarioRepository,
      sessionService
    ),
    i18nextService: makeI18nextServerService(
      repositories.sessionStorageRepository
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
