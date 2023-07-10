import {
  getMarbleAPIClient,
  type TokenService,
} from '@marble-front/api/marble';
import { adaptNodeDto } from '@marble-front/models';

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
