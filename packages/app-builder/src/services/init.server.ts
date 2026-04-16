import { initializeFeatureAccessAPIClient } from '@app-builder/infra/feature-access-api';
import { initializeMarbleCoreAPIClient } from '@app-builder/infra/marblecore-api';
import { makeServerRepositories, type ServerRepositories } from '@app-builder/repositories/init.server';
import { checkEnv, getServerEnv } from '@app-builder/utils/environment';

import { makeAuthenticationServerService } from './auth/auth.server';
import { makeOidcService } from './auth/oidc.server';
import { makeI18nextServerService } from './i18n/i18next.server';

function makeServerServices(repositories: ServerRepositories) {
  return {
    appConfigRepository: repositories.getAppConfigRepository(repositories.marbleCoreApiClient),
    featureAccessService: repositories.getFeatureAccessRepository(repositories.getFeatureAccessApiClientWithoutAuth()),
    authService: makeAuthenticationServerService({
      ...repositories,
      makeOidcService,
    }),
    i18nextService: makeI18nextServerService(),
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
