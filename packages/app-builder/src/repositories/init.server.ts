import { type GetMarbleAPIClient } from '@app-builder/infra/marble-api';

import { getCaseRepository } from './CaseRepository';
import { getDataModelRepository } from './DataModelRepository';
import { getDecisionRepository } from './DecisionRepository';
import { getEditorRepository } from './EditorRepository';
import { getMarbleAPIRepository } from './MarbleAPIRepository';
import { getOrganizationRepository } from './OrganizationRepository';
import { getScenarioRepository } from './ScenarioRepository';
import {
  getAuthStorageRepository,
  getCsrfStorageRepository,
  getToastStorageRepository,
  type SessionStorageRepositoryOptions,
} from './SessionStorageRepositories';
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
    csrfStorageRepository: getCsrfStorageRepository(
      sessionStorageRepositoryOptions,
    ),
    toastStorageRepository: getToastStorageRepository(
      sessionStorageRepositoryOptions,
    ),
    marbleAPIClient: getMarbleAPIRepository(getMarbleAPIClient),
    userRepository: getUserRepository(),
    editorRepository: getEditorRepository(),
    decisionRepository: getDecisionRepository(),
    caseRepository: getCaseRepository(),
    scenarioRepository: getScenarioRepository(),
    organizationRepository: getOrganizationRepository(),
    dataModelRepository: getDataModelRepository(),
  };
}

export type ServerRepositories = ReturnType<typeof makeServerRepositories>;
