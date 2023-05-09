import {
  defaults,
  fetchWithAuthMiddleware,
  postToken,
  TokenService,
} from '@marble-front/api/marble';
import { getServerEnv } from '@marble-front/builder/utils/environment';

defaults.baseUrl = getServerEnv('MARBLE_API_DOMAIN');

const bffTokenService = new TokenService({
  refreshToken: () => postToken({ refresh_token: 'token12345' }),
});

defaults.fetch = fetchWithAuthMiddleware({
  bffTokenService,
  getAuthorizationHeader: (token) => ({
    name: 'Authorization',
    value: `Bearer ${token}`,
  }),
});
