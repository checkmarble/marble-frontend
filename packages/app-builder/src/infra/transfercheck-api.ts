import {
  createBasicFetch,
  createFetchWithAuthMiddleware,
  type TokenService,
  transfercheckApi,
} from 'marble-api';
import * as R from 'remeda';
import type { FunctionKeys } from 'typescript-utils';

export type TransfercheckApi = {
  [P in FunctionKeys<typeof transfercheckApi>]: (typeof transfercheckApi)[P];
};

function getTransfercheckAPIClient({
  request,
  tokenService,
  baseUrl,
}: {
  request: Request;
  baseUrl: string;
  tokenService?: TokenService<string>;
}): TransfercheckApi {
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
  request,
  baseUrl,
}: {
  request: Request;
  baseUrl: string;
}): {
  transfercheckApi: TransfercheckApi;
  getTransfercheckAPIClientWithAuth: GetTransfercheckAPIClientWithAuth;
} {
  return {
    transfercheckApi: getTransfercheckAPIClient({ request, baseUrl }),
    getTransfercheckAPIClientWithAuth: (tokenService: TokenService<string>) =>
      getTransfercheckAPIClient({ request, tokenService, baseUrl }),
  };
}
