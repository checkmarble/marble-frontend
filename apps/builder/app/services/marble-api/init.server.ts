import {
  defaults,
  fetchWithAuthMiddleware,
  postToken,
  TokenService,
} from '@marble-front/api/marble';
import { getServerEnv } from '@marble-front/builder/utils/environment';

export function initMarbleAPI() {
  defaults.baseUrl = getServerEnv('MARBLE_API_DOMAIN');

  const bffTokenService = new TokenService({
    // use default fetch to bypass ensure fetchWithAuthMiddleware is not used
    refreshToken: () => postToken('token12345', { fetch: fetch }),
  });

  defaults.fetch = fetchWithAuthMiddleware({
    bffTokenService,
    getAuthorizationHeader: (token) => ({
      name: 'Authorization',
      value: `${token.token_type} ${token.access_token}`,
    }),
  });
}
