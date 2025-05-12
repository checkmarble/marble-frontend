import {
  createBasicFetch,
  createFetchWithAuthMiddleware,
  licenseApi,
  type TokenService,
} from 'marble-api';
import * as R from 'remeda';
import type { FunctionKeys } from 'typescript-utils';

//TODO: To remove

export type LicenseApi = {
  [P in FunctionKeys<typeof licenseApi>]: (typeof licenseApi)[P];
};

export type GetLicenseAPIClientWithAuth = (tokenService: TokenService<string>) => LicenseApi;

function getLicenseAPIClient({
  request,
  tokenService,
  baseUrl,
}: {
  request: Request;
  baseUrl: string;
  tokenService?: TokenService<string>;
}): LicenseApi {
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

  const { defaults, servers, ...api } = licenseApi;

  //@ts-expect-error can't infer args
  return R.mapValues(api, (value) => (...args) => {
    // @ts-expect-error can't infer args
    return value(...args, { fetch, baseUrl });
  });
}

type LicenseAPIClientParams = {
  request: Request;
  baseUrl: string;
};
export function initializeLicenseAPIClient({ request, baseUrl }: LicenseAPIClientParams): {
  licenseApi: LicenseApi;
  getLicenseAPIClientWithAuth: GetLicenseAPIClientWithAuth;
} {
  return {
    licenseApi: getLicenseAPIClient({ request, baseUrl }),
    getLicenseAPIClientWithAuth: (tokenService: TokenService<string>) =>
      getLicenseAPIClient({ request, tokenService, baseUrl }),
  };
}
