import { adaptNodeDto } from '@app-builder/models';
import { type TokenService } from '@marble-api';

import { getMarbleAPIClient } from './repositories';

async function listIdentifiers({
  scenarioId,
  tokenService,
  baseUrl,
}: {
  scenarioId: string;
  tokenService: TokenService<string>;
  baseUrl: string;
}) {
  const marbleApiClient = getMarbleAPIClient({
    tokenService,
    baseUrl,
  });

  const { data_accessors } = await marbleApiClient.listIdentifiers(scenarioId);

  const dataAccessors = data_accessors.map(adaptNodeDto);

  return { dataAccessors };
}

export const editor = {
  listIdentifiers,
};
