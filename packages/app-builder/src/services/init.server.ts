import { initializeGetMarbleAPIClient } from '@app-builder/infra/marble-api';
import {
  makeServerRepositories,
  type ServerRepositories,
} from '@app-builder/repositories/init.server';
import { getServerEnv } from '@app-builder/utils/environment.server';
import { CSRF } from 'remix-utils/csrf/server';

import { makeAuthenticationServerService } from './auth/auth.server';
import { makeSessionService } from './auth/session.server';
import { makeI18nextServerService } from './i18n/i18next.server';

function makeServerServices(repositories: ServerRepositories) {
  const csrfService = new CSRF({
    cookie: repositories.csrfCookie,
    // TODO: inject secret from init phase
    // secret: 's3cr3t',
  });
  const authSessionService = makeSessionService(
    repositories.authStorageRepository.authStorage,
  );
  const toastSessionService = makeSessionService(
    repositories.toastStorageRepository.toastStorage,
  );
  return {
    authSessionService,
    csrfService,
    toastSessionService,
    authService: makeAuthenticationServerService(
      repositories.marbleAPIClient,
      repositories.userRepository,
      repositories.inboxRepository,
      repositories.editorRepository,
      repositories.decisionRepository,
      repositories.caseRepository,
      repositories.organizationRepository,
      repositories.scenarioRepository,
      repositories.dataModelRepository,
      authSessionService,
      csrfService,
    ),
    i18nextService: makeI18nextServerService(
      repositories.authStorageRepository,
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
