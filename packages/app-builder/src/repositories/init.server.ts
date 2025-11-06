import { type FeatureAccessApi, type GetFeatureAccessAPIClientWithAuth } from '@app-builder/infra/feature-access-api';
import { type GetMarbleCoreAPIClientWithAuth, type MarbleCoreApi } from '@app-builder/infra/marblecore-api';
import { makeGetAiAssistSettingsRepository } from './AiAssistRepository';
import { makeGetAnalyticsRepository } from './AnalyticsRepository';
import { makeGetApiKeyRepository } from './ApiKeyRepository';
import { makeGetAppConfigRepository } from './AppConfigRepository';
import { makeGetCaseRepository } from './CaseRepository';
import { makeGetCustomListRepository } from './CustomListRepository';
import { makeGetDataModelRepository } from './DataModelRepository';
import { makeGetDecisionRepository } from './DecisionRepository';
import { makeGetEditorRepository } from './EditorRepository';
import { makeGetFeatureAccessRepository } from './FeatureAccessRepository';
import { makeGetInboxRepository } from './InboxRepository';
import { makeGetOrganizationRepository } from './OrganizationRepository';
import { makeGetPersonalSettingsRepository } from './PersonalSettingsRepository';
import { makeGetRuleSnoozeRepository } from './RuleSnoozeRepository';
import { makeGetScenarioIterationRuleRepository } from './ScenarioIterationRuleRepository';
import { makeGetScenarioIterationScreeningRepository } from './ScenarioIterationScreeningRepository';
import { makeGetScenarioRepository } from './ScenarioRepository';
import { makeGetScreeningRepository } from './ScreeningRepository';
import {
  getAuthStorageRepository,
  getCsrfCookie,
  getLngStorageRepository,
  getToastStorageRepository,
  type SessionStorageRepositoryOptions,
} from './SessionStorageRepositories';
import { makeGetTestRunRepository } from './TestRunRepository';
import { makeGetUserRepository } from './UserRepository';
import { makeGetWebhookRepository } from './WebhookRepository';

export function makeServerRepositories({
  sessionStorageRepositoryOptions,
  getFeatureAccessApiClientWithoutAuth,
  getFeatureAccessAPIClientWithAuth,
  marbleCoreApiClient,
  getMarbleCoreAPIClientWithAuth,
}: {
  sessionStorageRepositoryOptions: SessionStorageRepositoryOptions;
  getFeatureAccessApiClientWithoutAuth: () => FeatureAccessApi;
  getFeatureAccessAPIClientWithAuth: GetFeatureAccessAPIClientWithAuth;
  marbleCoreApiClient: MarbleCoreApi;
  getMarbleCoreAPIClientWithAuth: GetMarbleCoreAPIClientWithAuth;
}) {
  return {
    authStorageRepository: getAuthStorageRepository(sessionStorageRepositoryOptions),
    csrfCookie: getCsrfCookie(sessionStorageRepositoryOptions),
    toastStorageRepository: getToastStorageRepository(sessionStorageRepositoryOptions),
    lngStorageRepository: getLngStorageRepository(sessionStorageRepositoryOptions),
    getFeatureAccessApiClientWithoutAuth,
    getFeatureAccessAPIClientWithAuth,
    marbleCoreApiClient,
    getMarbleCoreAPIClientWithAuth,
    getUserRepository: makeGetUserRepository(),
    getInboxRepository: makeGetInboxRepository(),
    getEditorRepository: makeGetEditorRepository(),
    getDecisionRepository: makeGetDecisionRepository(),
    getCaseRepository: makeGetCaseRepository(),
    getScreeningRepository: makeGetScreeningRepository(),
    getCustomListRepository: makeGetCustomListRepository(),
    getScenarioRepository: makeGetScenarioRepository(),
    getScenarioIterationRuleRepository: makeGetScenarioIterationRuleRepository(),
    getScenarioIterationScreeningRepository: makeGetScenarioIterationScreeningRepository(),
    getOrganizationRepository: makeGetOrganizationRepository(),
    getDataModelRepository: makeGetDataModelRepository(),
    getApiKeyRepository: makeGetApiKeyRepository(),
    getAnalyticsRepository: makeGetAnalyticsRepository(),
    getWebhookRepository: makeGetWebhookRepository(),
    getRuleSnoozeRepository: makeGetRuleSnoozeRepository(),
    getTestRunRepository: makeGetTestRunRepository(),
    getAppConfigRepository: makeGetAppConfigRepository(),
    getFeatureAccessRepository: makeGetFeatureAccessRepository(),
    getPersonalSettingsRepository: makeGetPersonalSettingsRepository(),
    getAiAssistSettingsRepository: makeGetAiAssistSettingsRepository(),
  };
}

export type ServerRepositories = ReturnType<typeof makeServerRepositories>;
