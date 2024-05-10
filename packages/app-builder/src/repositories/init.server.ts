import { type GetMarbleAPIClient } from '@app-builder/infra/marble-api';

import { getAnalyticsRepository } from './AnalyticsRepository';
import { getApiKeyRepository } from './ApiKeyRepository';
import { getCaseRepository } from './CaseRepository';
import { getDataModelRepository } from './DataModelRepository';
import { getDecisionRepository } from './DecisionRepository';
import { getEditorRepository } from './EditorRepository';
import { getInboxRepository } from './InboxRepository';
import { getMarbleAPIRepository } from './MarbleAPIRepository';
import { getOrganizationRepository } from './OrganizationRepository';
import { getScenarioRepository } from './ScenarioRepository';
import {
  getAuthStorageRepository,
  getCsrfCookie,
  getToastStorageRepository,
  type SessionStorageRepositoryOptions,
} from './SessionStorageRepositories';
import { getTransferRepository } from './TransferRepository';
import { getUserRepository } from './UserRepository';

export function makeServerRepositories({
  sessionStorageRepositoryOptions,
  getMarbleAPIClient,
}: {
  sessionStorageRepositoryOptions: SessionStorageRepositoryOptions;
  getMarbleAPIClient: GetMarbleAPIClient;
}) {
  return {
    authStorageRepository: getAuthStorageRepository(
      sessionStorageRepositoryOptions,
    ),
    csrfCookie: getCsrfCookie(sessionStorageRepositoryOptions),
    toastStorageRepository: getToastStorageRepository(
      sessionStorageRepositoryOptions,
    ),
    marbleAPIClient: getMarbleAPIRepository(getMarbleAPIClient),
    userRepository: getUserRepository(),
    inboxRepository: getInboxRepository(),
    editorRepository: getEditorRepository(),
    decisionRepository: getDecisionRepository(),
    caseRepository: getCaseRepository(),
    scenarioRepository: getScenarioRepository(),
    organizationRepository: getOrganizationRepository(),
    dataModelRepository: getDataModelRepository(),
    apiKeyRepository: getApiKeyRepository(),
    analyticsRepository: getAnalyticsRepository(),
    transferRepository: getTransferRepository(),
  };
}

export type ServerRepositories = ReturnType<typeof makeServerRepositories>;
