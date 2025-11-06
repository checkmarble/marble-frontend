import { initializeFeatureAccessAPIClient } from '@app-builder/infra/feature-access-api';
import { initializeMarbleCoreAPIClient } from '@app-builder/infra/marblecore-api';
import {
  makeServerRepositories,
  type ServerRepositories,
} from '@app-builder/repositories/init.server';
import { checkEnv, getServerEnv } from '@app-builder/utils/environment';
import { CSRF } from 'remix-utils/csrf/server';

import { makeAuthenticationServerService } from './auth/auth.server';
import { makeOidcService } from './auth/oidc.server';
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
    appConfigRepository: repositories.getAppConfigRepository(repositories.marbleCoreApiClient),
    featureAccessService: repositories.getFeatureAccessRepository(
      repositories.getFeatureAccessApiClientWithoutAuth(),
    ),
    authService: makeAuthenticationServerService({
      ...repositories,
      authSessionService,
      toastSessionService,
      csrfService,
      makeOidcService,
    }),
    i18nextService: makeI18nextServerService(repositories.lngStorageRepository),
  };
}

export function initServerServices(request: Request) {
  checkEnv();

  const { getMarbleCoreAPIClientWithAuth, marbleCoreApiClient } = initializeMarbleCoreAPIClient({
    request,
    baseUrl: getServerEnv('MARBLE_API_URL'),
  });

  const { getFeatureAccessAPIClientWithAuth, featureAccessApi } = initializeFeatureAccessAPIClient({
    request,
    baseUrl: getServerEnv('MARBLE_API_URL'),
  });

  const proto = request.headers.get('x-forwarded-proto') ?? new URL(request.url).protocol;
  const serverRepositories = makeServerRepositories({
    getFeatureAccessApiClientWithoutAuth: () => featureAccessApi,
    getFeatureAccessAPIClientWithAuth,
    marbleCoreApiClient,
    getMarbleCoreAPIClientWithAuth,
    sessionStorageRepositoryOptions: {
      maxAge: Number(getServerEnv('SESSION_MAX_AGE')) || 43200,
      secrets: [getServerEnv('SESSION_SECRET')],
      secure: proto === 'https:',
    },
  });

  return makeServerServices(serverRepositories);
}
