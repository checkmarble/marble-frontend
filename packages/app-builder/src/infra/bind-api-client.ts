import { getServerEnv } from '@app-builder/utils/environment';
import { createBasicFetch, createFetchWithAuthMiddleware, type TokenService } from 'marble-api';
import * as R from 'remeda';

type Operation = (...args: unknown[]) => unknown;

/**
 * Binds every operation of a generated API module to this request's fetch and the Marble API URL.
 * Without a `tokenService`, the client sends unauthenticated requests.
 */
export function bindApiClient<Client>(
  operations: object,
  request: Request,
  tokenService?: TokenService<string>,
): Client {
  const fetch = tokenService
    ? createFetchWithAuthMiddleware({
        request,
        tokenService,
        getAuthorizationHeader: (token) => ({ name: 'Authorization', value: `Bearer ${token}` }),
      })
    : createBasicFetch({ request });
  const baseUrl = getServerEnv('MARBLE_API_URL');

  const { defaults: _, servers: __, ...api } = operations as Record<string, Operation>;
  return R.mapValues(
    api,
    (operation) =>
      (...args: unknown[]) =>
        operation(...args, { fetch, baseUrl }),
  ) as Client;
}
