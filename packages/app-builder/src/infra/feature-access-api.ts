import { createBasicFetch, createFetchWithAuthMiddleware, featureAccessApi, type TokenService } from 'marble-api';
import * as R from 'remeda';
import { type FunctionKeys } from 'typescript-utils';

export type FeatureAccessApi = {
  [P in FunctionKeys<typeof featureAccessApi>]: (typeof featureAccessApi)[P];
};

export type GetFeatureAccessAPIClientWithAuth = (tokenService: TokenService<string>) => FeatureAccessApi;

function getFeatureAccessAPIClient({
  request,
  tokenService,
  baseUrl,
}: {
  request: Request;
  baseUrl: string;
  tokenService?: TokenService<string>;
}): FeatureAccessApi {
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

  const { defaults: _, servers: __, ...api } = featureAccessApi;

  //@ts-expect-error can't infer args
  return R.mapValues(api, (value) => (...args) => {
    return value(...args, { fetch, baseUrl });
  });
}

type FeatureAccessAPIClientParams = {
  request: Request;
  baseUrl: string;
};
export function initializeFeatureAccessAPIClient({ request, baseUrl }: FeatureAccessAPIClientParams): {
  featureAccessApi: FeatureAccessApi;
  getFeatureAccessAPIClientWithAuth: GetFeatureAccessAPIClientWithAuth;
} {
  return {
    featureAccessApi: getFeatureAccessAPIClient({ request, baseUrl }),
    getFeatureAccessAPIClientWithAuth: (tokenService: TokenService<string>) =>
      getFeatureAccessAPIClient({ request, tokenService, baseUrl }),
  };
}
