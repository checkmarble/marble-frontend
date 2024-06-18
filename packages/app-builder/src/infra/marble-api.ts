import {
  fetchWithAuthMiddleware,
  marbleApi,
  type TokenService,
} from 'marble-api';
import * as R from 'remeda';

type FunctionKeys<T> = {
  // eslint-disable-next-line @typescript-eslint/ban-types
  [P in keyof T]: T[P] extends Function ? P : never;
}[keyof T];

export type MarbleApi = {
  [P in FunctionKeys<typeof marbleApi>]: (typeof marbleApi)[P];
};

function getMarbleAPIClient({
  tokenService,
  baseUrl,
}: {
  baseUrl: string;
  tokenService?: TokenService<string>;
}): MarbleApi {
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
  const { defaults, servers, ...api } = marbleApi;

  //@ts-expect-error can't infer args
  return R.mapValues(api, (value) => (...args) => {
    // @ts-expect-error can't infer args
    // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
    return value(...args, { fetch, baseUrl });
  });
}

export type GetMarbleAPIClientWithAuth = (
  tokenService: TokenService<string>,
) => MarbleApi;

export function initializeMarbleAPIClient({ baseUrl }: { baseUrl: string }): {
  marbleApiClient: MarbleApi;
  getMarbleAPIClientWithAuth: GetMarbleAPIClientWithAuth;
} {
  return {
    marbleApiClient: getMarbleAPIClient({ baseUrl }),
    getMarbleAPIClientWithAuth: (tokenService: TokenService<string>) =>
      getMarbleAPIClient({ tokenService, baseUrl }),
  };
}
