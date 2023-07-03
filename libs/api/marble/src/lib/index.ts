import * as marbleApi from './generated/marble-api';
import { fetchWithAuthMiddleware, type TokenService } from './openapi';

export * from './fixtures';
export * from './generated/marble-api';

import * as R from 'remeda';

export type { TokenService };
export { marbleApi };

type FunctionKeys<T> = {
  // eslint-disable-next-line @typescript-eslint/ban-types
  [P in keyof T]: T[P] extends Function ? P : never;
}[keyof T];

export type MarbleApi = {
  [P in FunctionKeys<typeof marbleApi>]: (typeof marbleApi)[P];
};

export function getMarbleAPIClient({
  tokenService,
  baseUrl,
}: {
  baseUrl: string;
  tokenService: TokenService<string>;
}): MarbleApi {
  const fetch = fetchWithAuthMiddleware({
    tokenService,
    getAuthorizationHeader: (token) => ({
      name: 'Authorization',
      value: `Bearer ${token}`,
    }),
  });

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { defaults, servers, ...api } = marbleApi;

  //@ts-expect-error can't infer args
  return R.mapValues(api, (value) => (...args) => {
    //@ts-expect-error can't infer args
    return value(...args, { fetch, baseUrl });
  });
}
