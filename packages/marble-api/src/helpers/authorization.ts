import { BasicFetchParams, createBasicFetch } from './basic-fetch';

export interface TokenService<Token> {
  getToken: () => Promise<Token | undefined>;
  refreshToken: () => Promise<Token>;
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
      // TODO: here, we use the new tokens for the current request, but it is
      // not persisted in the browser, so we are going to be refreshing
      // constantly.
      const token = await tokenService.refreshToken();
      const { name, value } = getAuthorizationHeader(token);
      headers.set(name, value);
      return fetch(input, { ...init, headers });
    }

    return response;
  };
}
