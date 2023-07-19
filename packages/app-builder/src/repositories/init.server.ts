import { type GetMarbleAPIClient } from '@app-builder/infra/marble-api';

import { getEditorRepository } from './EditorRepository';
import { getMarbleAPIRepository } from './MarbleAPIRepository';
import { getScenarioRepository } from './ScenarioRepository';
import {
  getSessionStorageRepository,
  type SessionStorageRepositoryOptions,
} from './SessionStorageRepository';

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
    editorRepository: getEditorRepository(),
    scenarioRepository: getScenarioRepository(),
  };
}

export type ServerRepositories = ReturnType<typeof makeServerRepositories>;
