import { initializeLicenseAPIClient } from '@app-builder/infra/license-api';
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
import { makeFeatureAccessService } from './feature-access.server';
import { makeI18nextServerService } from './i18n/i18next.server';
import { makeLicenseServerService } from './license.server';

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
  const licenseService = makeLicenseServerService({
    licenseKey: getServerEnv('LICENSE_KEY'),
    licenseRepository: repositories.licenseRepository,
  });
  return {
    authSessionService,
    csrfService,
    toastSessionService,
    authService: makeAuthenticationServerService({
      ...repositories,
      authSessionService,
      csrfService,
    }),
    i18nextService: makeI18nextServerService(repositories.lngStorageRepository),
    licenseService,
    featureAccessService: makeFeatureAccessService({
      getLicenseEntitlements: licenseService.getLicenseEntitlements,
    }),
  };
}

function initServerServices() {
  checkEnv();

  const devEnvironment = getServerEnv('FIREBASE_CONFIG').withEmulator;

  const { getMarbleCoreAPIClientWithAuth } = initializeMarbleCoreAPIClient({
    baseUrl: getServerEnv('MARBLE_API_DOMAIN_SERVER'),
  });

  const { getTransfercheckAPIClientWithAuth } =
    initializeTransfercheckAPIClient({
      baseUrl: getServerEnv('MARBLE_API_DOMAIN_SERVER'),
    });

  const { licenseAPIClient } = initializeLicenseAPIClient({
    baseUrl: 'https://api.checkmarble.com',
  });

  const serverRepositories = makeServerRepositories({
    devEnvironment,
    licenseAPIClient,
    getMarbleCoreAPIClientWithAuth,
    getTransfercheckAPIClientWithAuth,
    sessionStorageRepositoryOptions: {
      maxAge: Number(getServerEnv('SESSION_MAX_AGE')),
      secrets: [getServerEnv('SESSION_SECRET')],
      secure:
        getServerEnv('ENV') !== 'development'
          ? // Outside of development, we always want to set secure cookies
            true
          : // User agent only allows secure cookies to be set on secure connections (useful for people deploying Docker compose outside localhost and whithout SSL)
            new URL(getServerEnv('MARBLE_APP_DOMAIN')).protocol === 'https:',
    },
  });

  return makeServerServices(serverRepositories);
}

export const serverServices = initServerServices();
