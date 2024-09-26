import {
  fetchWithAuthMiddleware,
  marblecoreApi,
  type TokenService,
} from 'marble-api';
import * as R from 'remeda';
import { type FunctionKeys } from 'typescript-utils';

export type MarbleCoreApi = {
  [P in FunctionKeys<typeof marblecoreApi>]: (typeof marblecoreApi)[P];
};

function getMarbleCoreAPIClient({
  tokenService,
  baseUrl,
}: {
  baseUrl: string;
  tokenService?: TokenService<string>;
}): MarbleCoreApi {
  const fetch = tokenService
    ? fetchWithAuthMiddleware({
        tokenService,
        getAuthorizationHeader: (token) => ({
          name: 'Authorization',
          value: `Bearer ${token}`,
        }),
      })
    : undefined;

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { defaults, servers, ...api } = marblecoreApi;

  //@ts-expect-error can't infer args
  return R.mapValues(api, (value) => (...args) => {
    // @ts-expect-error can't infer args
    // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
    return value(...args, { fetch, baseUrl });
  });
}

export type GetMarbleCoreAPIClientWithAuth = (
  tokenService: TokenService<string>,
) => MarbleCoreApi;

export function initializeMarbleCoreAPIClient({
  baseUrl,
}: {
  baseUrl: string;
}): {
  marbleCoreApiClient: MarbleCoreApi;
  getMarbleCoreAPIClientWithAuth: GetMarbleCoreAPIClientWithAuth;
} {
  return {
    marbleCoreApiClient: getMarbleCoreAPIClient({ baseUrl }),
    getMarbleCoreAPIClientWithAuth: (tokenService: TokenService<string>) =>
      getMarbleCoreAPIClient({ tokenService, baseUrl }),
  };
}
