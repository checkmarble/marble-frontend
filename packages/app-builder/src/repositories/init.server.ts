import {
  getSessionStorageRepository,
  type SessionStorageRepository,
  type SessionStorageRepositoryOptions,
} from './SessionStorageRepository';

export interface ServerRepositories {
  sessionStorageRepository: SessionStorageRepository;
}

export function makeServerRepositories({
  sessionStorageRepositoryOptions,
}: {
  sessionStorageRepositoryOptions: SessionStorageRepositoryOptions;
}): ServerRepositories {
  return {
    sessionStorageRepository: getSessionStorageRepository(
      sessionStorageRepositoryOptions
    ),
  };
}
