export interface TokenService<Token> {
  getToken: () => Promise<Token | undefined>;
  refreshToken: () => Promise<Token>;
}

function forwardHeader(
  currentHeaders: Headers,
  newHeaders: Headers,
  name: string,
  defaultValue?: string,
) {
  const headerValue = currentHeaders.get(name) ?? defaultValue;
  if (headerValue !== null && headerValue !== undefined) {
    newHeaders.set(name, headerValue);
  }
}

type BasicFetchParams = { request: Request };
export function createBasicFetch({ request }: BasicFetchParams) {
  return async (input: RequestInfo | URL, init?: RequestInit) => {
    const headers = new Headers(init?.headers);

    // forwarding trace headers
    forwardHeader(request.headers, headers, 'traceparent');
    forwardHeader(request.headers, headers, 'X-Cloud-Trace-Context');

    return fetch(input, { ...init, headers });
  };
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
  return async (input: RequestInfo | URL, init?: RequestInit) => {
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
      return fetch(input, { ...init, headers });
    }

    return response;
  };
}
