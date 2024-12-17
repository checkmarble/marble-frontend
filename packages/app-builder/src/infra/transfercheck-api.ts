import {
  fetchWithAuthMiddleware,
  type TokenService,
  transfercheckApi,
} from 'marble-api';
import * as R from 'remeda';
import { type FunctionKeys } from 'typescript-utils';

export type TransfercheckApi = {
  [P in FunctionKeys<typeof transfercheckApi>]: (typeof transfercheckApi)[P];
};

function getTransfercheckAPIClient({
  tokenService,
  baseUrl,
}: {
  baseUrl: string;
  tokenService?: TokenService<string>;
}): TransfercheckApi {
  const fetch = tokenService
    ? fetchWithAuthMiddleware({
        tokenService,
        getAuthorizationHeader: (token) => ({
          name: 'Authorization',
          value: `Bearer ${token}`,
        }),
      })
    : undefined;

  const { defaults, servers, ...api } = transfercheckApi;

  //@ts-expect-error can't infer args
  return R.mapValues(api, (value) => (...args) => {
    // @ts-expect-error can't infer args

    return value(...args, { fetch, baseUrl });
  });
}

export type GetTransfercheckAPIClientWithAuth = (
  tokenService: TokenService<string>,
) => TransfercheckApi;

export function initializeTransfercheckAPIClient({
  baseUrl,
}: {
  baseUrl: string;
}): {
  transfercheckApi: TransfercheckApi;
  getTransfercheckAPIClientWithAuth: GetTransfercheckAPIClientWithAuth;
} {
  return {
    transfercheckApi: getTransfercheckAPIClient({ baseUrl }),
    getTransfercheckAPIClientWithAuth: (tokenService: TokenService<string>) =>
      getTransfercheckAPIClient({ tokenService, baseUrl }),
  };
}
