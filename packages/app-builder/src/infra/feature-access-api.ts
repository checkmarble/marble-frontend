import { featureAccessApi, type TokenService } from 'marble-api';
import { type FunctionKeys } from 'typescript-utils';
import { bindApiClient } from './bind-api-client';

export type FeatureAccessApi = {
  [P in FunctionKeys<typeof featureAccessApi>]: (typeof featureAccessApi)[P];
};

export function createFeatureAccessApi(request: Request, tokenService?: TokenService<string>): FeatureAccessApi {
  return bindApiClient<FeatureAccessApi>(featureAccessApi, request, tokenService);
}
