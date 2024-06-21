import { type LicenseApi } from '@app-builder/infra/license-api';
import { type GetMarbleAPIClientWithAuth } from '@app-builder/infra/marble-api';

import { makeGetAnalyticsRepository } from './AnalyticsRepository';
import { makeGetApiKeyRepository } from './ApiKeyRepository';
import { makeGetCaseRepository } from './CaseRepository';
import { makeGetDataModelRepository } from './DataModelRepository';
import { makeGetDecisionRepository } from './DecisionRepository';
import { makeGetEditorRepository } from './EditorRepository';
import { makeGetInboxRepository } from './InboxRepository';
import { getLicenseRepository } from './LicenseRepository';
import { makeGetOrganizationRepository } from './OrganizationRepository';
import { makeGetScenarioIterationRuleRepository } from './ScenarioIterationRuleRepository';
import { makeGetScenarioRepository } from './ScenarioRepository';
import {
  getAuthStorageRepository,
  getCsrfCookie,
  getToastStorageRepository,
  type SessionStorageRepositoryOptions,
} from './SessionStorageRepositories';
import { makeGetTransferRepository } from './TransferRepository';
import { makeGetUserRepository } from './UserRepository';

export function makeServerRepositories({
  devEnvironment,
  sessionStorageRepositoryOptions,
  licenseAPIClient,
  getMarbleAPIClientWithAuth,
}: {
  devEnvironment: boolean;
  sessionStorageRepositoryOptions: SessionStorageRepositoryOptions;
  licenseAPIClient: LicenseApi;
  getMarbleAPIClientWithAuth: GetMarbleAPIClientWithAuth;
}) {
  return {
    authStorageRepository: getAuthStorageRepository(
      sessionStorageRepositoryOptions,
    ),
    csrfCookie: getCsrfCookie(sessionStorageRepositoryOptions),
    toastStorageRepository: getToastStorageRepository(
      sessionStorageRepositoryOptions,
    ),
    getMarbleAPIClientWithAuth,
    getUserRepository: makeGetUserRepository(),
    getInboxRepository: makeGetInboxRepository(),
    getEditorRepository: makeGetEditorRepository(),
    getDecisionRepository: makeGetDecisionRepository(),
    getCaseRepository: makeGetCaseRepository(),
    getScenarioRepository: makeGetScenarioRepository(),
    getScenarioIterationRuleRepository:
      makeGetScenarioIterationRuleRepository(),
    getOrganizationRepository: makeGetOrganizationRepository(),
    getDataModelRepository: makeGetDataModelRepository(),
    getApiKeyRepository: makeGetApiKeyRepository(),
    getAnalyticsRepository: makeGetAnalyticsRepository(),
    getTransferRepository: makeGetTransferRepository(),
    licenseRepository: getLicenseRepository(licenseAPIClient, devEnvironment),
  };
}

export type ServerRepositories = ReturnType<typeof makeServerRepositories>;
