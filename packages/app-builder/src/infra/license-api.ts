import {
  fetchWithAuthMiddleware,
  licenseApi,
  type TokenService,
} from 'marble-api';
import * as R from 'remeda';
import { type FunctionKeys } from 'typescript-utils';

//TODO: To remove

export type LicenseApi = {
  [P in FunctionKeys<typeof licenseApi>]: (typeof licenseApi)[P];
};

export type GetLicenseAPIClientWithAuth = (
  tokenService: TokenService<string>,
) => LicenseApi;

function getLicenseAPIClient({
  tokenService,
  baseUrl,
}: {
  baseUrl: string;
  tokenService?: TokenService<string>;
}): LicenseApi {
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
  const { defaults, servers, ...api } = licenseApi;

  //@ts-expect-error can't infer args
  return R.mapValues(api, (value) => (...args) => {
    // @ts-expect-error can't infer args
    // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
    return value(...args, { fetch, baseUrl });
  });
}

export function initializeLicenseAPIClient({ baseUrl }: { baseUrl: string }): {
  licenseApi: LicenseApi;
  getLicenseAPIClientWithAuth: GetLicenseAPIClientWithAuth;
} {
  return {
    licenseApi: getLicenseAPIClient({ baseUrl }),
    getLicenseAPIClientWithAuth: (tokenService: TokenService<string>) =>
      getLicenseAPIClient({ tokenService, baseUrl }),
  };
}
