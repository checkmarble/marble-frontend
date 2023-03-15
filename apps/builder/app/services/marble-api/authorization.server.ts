import {
  AuthorizationApi,
  Configuration,
  getAuthorizationMiddleware,
  TokenService,
} from '@marble-front/api/marble';
import { getServerEnv } from '@marble-front/builder/utils/environment';

const authorizationApiConf = new Configuration({
  basePath: getServerEnv('MARBLE_API_DOMAIN'),
});

export const authorizationApi = new AuthorizationApi(authorizationApiConf);

const bffTokenService = new TokenService({
  refreshToken: async () =>
    authorizationApi.postTokenBff({
      clientId: getServerEnv('MARBLE_API_CLIENT_ID'),
      clientSecret: getServerEnv('MARBLE_API_CLIENT_SECRET'),
    }),
});

export const AuthorizationMiddleware = getAuthorizationMiddleware({
  bffTokenService,
  getAuthorizationHeader: (token) => ({
    name: 'Authorization',
    value: `Bearer ${token.accessToken}`,
  }),
});
