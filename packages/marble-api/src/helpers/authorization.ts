import { marblecoreApi } from 'marble-api';
import { BasicFetchParams, createBasicFetch } from './basic-fetch';

export type TokenServiceUpdate =
  | { status: false; marbleToken: null; refreshToken: null }
  | { status: true; marbleToken: marblecoreApi.Token; refreshToken: string | null };

export interface TokenService<Token> {
  getToken: () => Promise<Token | undefined>;
  getUpdate: () => TokenServiceUpdate;
  refreshToken: () => Promise<Token>;
  tokenUpdated: boolean;
}

type FetchWithAuthMiddlewareParam<Token> = BasicFetchParams & {
  tokenService: TokenService<Token>;
  getAuthorizationHeader: (token: Token) => { name: string; value: string };
};
export function createFetchWithAuthMiddleware<Token>({
  request,
  tokenService,
  getAuthorizationHeader,
}: FetchWithAuthMiddlewareParam<Token>) {
  return async function authFetch(input: RequestInfo | URL, init?: RequestInit) {
    const headers = new Headers(init?.headers);
    const basicFetch = createBasicFetch({ request });

    const token = await tokenService.getToken();
    if (token) {
      const { name, value } = getAuthorizationHeader(token);
      headers.set(name, value);
    }
    const response = await basicFetch(input, { ...init, headers });

    if (response.status === 401) {
      const token = await tokenService.refreshToken();
      const { name, value } = getAuthorizationHeader(token);
      headers.set(name, value);
      return basicFetch(input, { ...init, headers });
    }

    return response;
  };
}
