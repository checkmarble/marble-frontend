import { type GetMarbleAPIClient } from '@app-builder/infra/marble-api';

export type MarbleAPIRepository = ReturnType<typeof getMarbleAPIRepository>;

// Raw access to the api client.
// May be removed in the future, when all repositories are implemented
export function getMarbleAPIRepository(getMarbleAPIClient: GetMarbleAPIClient) {
  return getMarbleAPIClient;
}
