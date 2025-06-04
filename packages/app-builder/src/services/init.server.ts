import { initializeFeatureAccessAPIClient } from '@app-builder/infra/license-api';
import { initializeMarbleCoreAPIClient } from '@app-builder/infra/marblecore-api';
import { initializeTransfercheckAPIClient } from '@app-builder/infra/transfercheck-api';
import {
  makeServerRepositories,
  type ServerRepositories,
} from '@app-builder/repositories/init.server';
import { checkEnv, getServerEnv } from '@app-builder/utils/environment';
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
  const authSessionService = makeSessionService({
    sessionStorage: repositories.authStorageRepository.authStorage,
  });
  const toastSessionService = makeSessionService({
    sessionStorage: repositories.toastStorageRepository.toastStorage,
  });
  return {
    authSessionService,
    csrfService,
    toastSessionService,
    signupRepository: repositories.getSignupStatusRepository(repositories.marbleCoreApiClient),
    versionRepository: repositories.getVersionRepository(repositories.marbleCoreApiClient),
    licenseService: repositories.getLicenseRepository(
      repositories.getFeatureAccessApiClientWithoutAuth(),
    ),
    authService: makeAuthenticationServerService({
      ...repositories,
      authSessionService,
      csrfService,
    }),
    i18nextService: makeI18nextServerService(repositories.lngStorageRepository),
  };
}

export function initServerServices(request: Request) {
  checkEnv();

  const { getMarbleCoreAPIClientWithAuth, marbleCoreApiClient } = initializeMarbleCoreAPIClient({
    request,
    baseUrl: getServerEnv('MARBLE_API_URL_SERVER'),
  });

  const { getTransfercheckAPIClientWithAuth } = initializeTransfercheckAPIClient({
    request,
    baseUrl: getServerEnv('MARBLE_API_URL_SERVER'),
  });

  const { getFeatureAccessAPIClientWithAuth, featureAccessApi } = initializeFeatureAccessAPIClient({
    request,
    baseUrl: getServerEnv('MARBLE_API_URL_SERVER'),
  });

  const serverRepositories = makeServerRepositories({
    getFeatureAccessApiClientWithoutAuth: () => featureAccessApi,
    getFeatureAccessAPIClientWithAuth,
    marbleCoreApiClient,
    getMarbleCoreAPIClientWithAuth,
    getTransfercheckAPIClientWithAuth,
    sessionStorageRepositoryOptions: {
      maxAge: Number(getServerEnv('SESSION_MAX_AGE')) || 43200,
      secrets: [getServerEnv('SESSION_SECRET')],
      secure:
        getServerEnv('ENV') !== 'development'
          ? // Outside of development, we always want to set secure cookies
            true
          : // User agent only allows secure cookies to be set on secure connections (useful for people deploying Docker compose outside localhost and whithout SSL)
            new URL(getServerEnv('MARBLE_APP_URL')).protocol === 'https:',
    },
  });

  return makeServerServices(serverRepositories);
}
