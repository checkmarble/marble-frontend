import { type LicenseApi } from '@app-builder/infra/license-api';
import { type GetMarbleCoreAPIClientWithAuth } from '@app-builder/infra/marblecore-api';
import { type GetTransfercheckAPIClientWithAuth } from '@app-builder/infra/transfercheck-api';

import { makeGetAnalyticsRepository } from './AnalyticsRepository';
import { makeGetApiKeyRepository } from './ApiKeyRepository';
import { makeGetCaseRepository } from './CaseRepository';
import { makeGetCustomListRepository } from './CustomListRepository';
import { makeGetDataModelRepository } from './DataModelRepository';
import { makeGetDecisionRepository } from './DecisionRepository';
import { makeGetEditorRepository } from './EditorRepository';
import { makeGetInboxRepository } from './InboxRepository';
import { getLicenseRepository } from './LicenseRepository';
import { makeGetOrganizationRepository } from './OrganizationRepository';
import { makeGetPartnerRepository } from './PartnerRepository';
import { makeGetRuleSnoozeRepository } from './RuleSnoozeRepository';
import { makeGetScenarioIterationRuleRepository } from './ScenarioIterationRuleRepository';
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
import { makeGetWebhookRepository } from './WebhookRepository';

export function makeServerRepositories({
  devEnvironment,
  sessionStorageRepositoryOptions,
  licenseAPIClient,
  getMarbleCoreAPIClientWithAuth,
  getTransfercheckAPIClientWithAuth,
}: {
  devEnvironment: boolean;
  sessionStorageRepositoryOptions: SessionStorageRepositoryOptions;
  licenseAPIClient: LicenseApi;
  getMarbleCoreAPIClientWithAuth: GetMarbleCoreAPIClientWithAuth;
  getTransfercheckAPIClientWithAuth: GetTransfercheckAPIClientWithAuth;
}) {
  return {
    authStorageRepository: getAuthStorageRepository(
      sessionStorageRepositoryOptions,
    ),
    csrfCookie: getCsrfCookie(sessionStorageRepositoryOptions),
    toastStorageRepository: getToastStorageRepository(
      sessionStorageRepositoryOptions,
    ),
    lngStorageRepository: getLngStorageRepository(
      sessionStorageRepositoryOptions,
    ),
    getMarbleCoreAPIClientWithAuth,
    getTransfercheckAPIClientWithAuth,
    getUserRepository: makeGetUserRepository(),
    getInboxRepository: makeGetInboxRepository(),
    getEditorRepository: makeGetEditorRepository(),
    getDecisionRepository: makeGetDecisionRepository(),
    getCaseRepository: makeGetCaseRepository(),
    getCustomListRepository: makeGetCustomListRepository(),
    getScenarioRepository: makeGetScenarioRepository(),
    getScenarioIterationRuleRepository:
      makeGetScenarioIterationRuleRepository(),
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
    licenseRepository: getLicenseRepository(licenseAPIClient, devEnvironment),
  };
}

export type ServerRepositories = ReturnType<typeof makeServerRepositories>;
