import {
  createBasicFetch,
  createFetchWithAuthMiddleware,
  marblecoreApi,
  type TokenService,
} from 'marble-api';
import * as R from 'remeda';
import type { FunctionKeys } from 'typescript-utils';

export type MarbleCoreApi = {
  [P in FunctionKeys<typeof marblecoreApi>]: (typeof marblecoreApi)[P];
};

function getMarbleCoreAPIClient({
  request,
  tokenService,
  baseUrl,
}: {
  request: Request;
  baseUrl: string;
  tokenService?: TokenService<string>;
}): MarbleCoreApi {
  const fetch = tokenService
    ? createFetchWithAuthMiddleware({
        request,
        tokenService,
        getAuthorizationHeader: (token) => ({
          name: 'Authorization',
          value: `Bearer ${token}`,
        }),
      })
    : createBasicFetch({ request });

  const { defaults, servers, ...api } = marblecoreApi;

  //@ts-expect-error can't infer args
  return R.mapValues(api, (value) => (...args) => {
    // @ts-expect-error can't infer args

    return value(...args, { fetch, baseUrl });
  });
}

export type GetMarbleCoreAPIClientWithAuth = (tokenService: TokenService<string>) => MarbleCoreApi;

export function initializeMarbleCoreAPIClient({
  request,
  baseUrl,
}: {
  request: Request;
  baseUrl: string;
}): {
  marbleCoreApiClient: MarbleCoreApi;
  getMarbleCoreAPIClientWithAuth: GetMarbleCoreAPIClientWithAuth;
} {
  return {
    marbleCoreApiClient: getMarbleCoreAPIClient({ request, baseUrl }),
    getMarbleCoreAPIClientWithAuth: (tokenService: TokenService<string>) =>
      getMarbleCoreAPIClient({ request, tokenService, baseUrl }),
  };
}
