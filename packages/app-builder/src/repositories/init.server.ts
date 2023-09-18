import { type GetMarbleAPIClient } from '@app-builder/infra/marble-api';

import { getEditorRepository } from './EditorRepository';
import { getMarbleAPIRepository } from './MarbleAPIRepository';
import { getOrganizationRepository } from './OrganizationRepository';
import { getScenarioRepository } from './ScenarioRepository';
import {
  getSessionStorageRepository,
  type SessionStorageRepositoryOptions,
} from './SessionStorageRepository';
import { getUserRepository } from './UserRepository';

export function makeServerRepositories({
  sessionStorageRepositoryOptions,
  getMarbleAPIClient,
}: {
  sessionStorageRepositoryOptions: SessionStorageRepositoryOptions;
  getMarbleAPIClient: GetMarbleAPIClient;
}) {
  return {
    sessionStorageRepository: getSessionStorageRepository(
      sessionStorageRepositoryOptions
    ),
    marbleAPIClient: getMarbleAPIRepository(getMarbleAPIClient),
    userRepository: getUserRepository(),
    editorRepository: getEditorRepository(),
    scenarioRepository: getScenarioRepository(),
    organizationRepository: getOrganizationRepository(),
  };
}

export type ServerRepositories = ReturnType<typeof makeServerRepositories>;
