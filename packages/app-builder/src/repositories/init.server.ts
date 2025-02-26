import { type GetLicenseAPIClientWithAuth, type LicenseApi } from '@app-builder/infra/license-api';
import {
  type GetMarbleCoreAPIClientWithAuth,
  type MarbleCoreApi,
} from '@app-builder/infra/marblecore-api';
import { type GetTransfercheckAPIClientWithAuth } from '@app-builder/infra/transfercheck-api';

import { makeGetAnalyticsRepository } from './AnalyticsRepository';
import { makeGetApiKeyRepository } from './ApiKeyRepository';
import { makeGetCaseRepository } from './CaseRepository';
import { makeGetCustomListRepository } from './CustomListRepository';
import { makeGetDataModelRepository } from './DataModelRepository';
import { makeGetDecisionRepository } from './DecisionRepository';
import { makeGetEditorRepository } from './EditorRepository';
import { makeGetInboxRepository } from './InboxRepository';
import { makeGetLicenseRepository } from './LicenseRepository';
import { makeGetOrganizationRepository } from './OrganizationRepository';
import { makeGetPartnerRepository } from './PartnerRepository';
import { makeGetRuleSnoozeRepository } from './RuleSnoozeRepository';
import { makeGetSanctionCheckRepository } from './SanctionCheckRepository';
import { makeGetScenarioIterationRuleRepository } from './ScenarioIterationRuleRepository';
import { makeGetScenarioIterationSanctionRepository } from './ScenarioIterationSanctionRepository';
import { makeGetScenarioRepository } from './ScenarioRepository';
import {
  getAuthStorageRepository,
  getCsrfCookie,
  getLngStorageRepository,
  getToastStorageRepository,
  type SessionStorageRepositoryOptions,
} from './SessionStorageRepositories';
import { makeGetTestRunRepository } from './TestRunRepository';
import { makeGetTransferAlertRepository } from './TransferAlertRepository';
import { makeGetTransferRepository } from './TransferRepository';
import { makeGetUserRepository } from './UserRepository';
import { makeGetVersionRepository } from './VersionRepository';
import { makeGetWebhookRepository } from './WebhookRepository';

export function makeServerRepositories({
  devEnvironment,
  sessionStorageRepositoryOptions,
  getLicenseApiClientWithoutAuth,
  getLicenseAPIClientWithAuth,
  marbleCoreApiClient,
  getMarbleCoreAPIClientWithAuth,
  getTransfercheckAPIClientWithAuth,
}: {
  devEnvironment: boolean;
  sessionStorageRepositoryOptions: SessionStorageRepositoryOptions;
  getLicenseApiClientWithoutAuth: () => LicenseApi;
  getLicenseAPIClientWithAuth: GetLicenseAPIClientWithAuth;
  marbleCoreApiClient: MarbleCoreApi;
  getMarbleCoreAPIClientWithAuth: GetMarbleCoreAPIClientWithAuth;
  getTransfercheckAPIClientWithAuth: GetTransfercheckAPIClientWithAuth;
}) {
  return {
    authStorageRepository: getAuthStorageRepository(sessionStorageRepositoryOptions),
    csrfCookie: getCsrfCookie(sessionStorageRepositoryOptions),
    toastStorageRepository: getToastStorageRepository(sessionStorageRepositoryOptions),
    lngStorageRepository: getLngStorageRepository(sessionStorageRepositoryOptions),
    getLicenseApiClientWithoutAuth,
    getLicenseAPIClientWithAuth,
    marbleCoreApiClient,
    getMarbleCoreAPIClientWithAuth,
    getTransfercheckAPIClientWithAuth,
    getUserRepository: makeGetUserRepository(),
    getInboxRepository: makeGetInboxRepository(),
    getEditorRepository: makeGetEditorRepository(),
    getDecisionRepository: makeGetDecisionRepository(),
    getCaseRepository: makeGetCaseRepository(),
    getSanctionCheckRepository: makeGetSanctionCheckRepository(),
    getCustomListRepository: makeGetCustomListRepository(),
    getScenarioRepository: makeGetScenarioRepository(),
    getScenarioIterationRuleRepository: makeGetScenarioIterationRuleRepository(),
    getScenarioIterationSanctionRepository: makeGetScenarioIterationSanctionRepository(),
    getOrganizationRepository: makeGetOrganizationRepository(),
    getDataModelRepository: makeGetDataModelRepository(),
    getApiKeyRepository: makeGetApiKeyRepository(),
    getAnalyticsRepository: makeGetAnalyticsRepository(),
    getTransferRepository: makeGetTransferRepository(),
    getPartnerRepository: makeGetPartnerRepository(),
    getTransferAlertRepository: makeGetTransferAlertRepository(),
    getWebhookRepository: makeGetWebhookRepository(),
    getRuleSnoozeRepository: makeGetRuleSnoozeRepository(),
    getTestRunRepository: makeGetTestRunRepository(),
    getLicenseRepository: makeGetLicenseRepository(devEnvironment),
    getVersionRepository: makeGetVersionRepository(),
  };
}

export type ServerRepositories = ReturnType<typeof makeServerRepositories>;
