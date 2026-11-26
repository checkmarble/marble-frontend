import { marblecoreApi, type TokenService } from 'marble-api';
import { type FunctionKeys } from 'typescript-utils';
import { bindApiClient } from './bind-api-client';

export type MarbleCoreApi = {
  [P in FunctionKeys<typeof marblecoreApi>]: (typeof marblecoreApi)[P];
};

export function createMarbleApi(request: Request, tokenService?: TokenService<string>): MarbleCoreApi {
  return bindApiClient<MarbleCoreApi>(marblecoreApi, request, tokenService);
}
