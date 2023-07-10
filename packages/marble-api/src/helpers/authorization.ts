export interface TokenService<Token> {
  getToken: () => Promise<Token | undefined>;
  refreshToken: () => Promise<Token>;
}

export function fetchWithAuthMiddleware<Token>({
  tokenService,
  getAuthorizationHeader,
}: {
  tokenService: TokenService<Token>;
  getAuthorizationHeader: (token: Token) => { name: string; value: string };
}): typeof fetch {
  return async (input, init) => {
    const headers = new Headers(init?.headers);

    const token = await tokenService.getToken();
    if (token) {
      const { name, value } = getAuthorizationHeader(token);
      headers.set(name, value);
    }
    const response = await fetch(input, { ...init, headers });

    if (response.status === 401) {
      const token = await tokenService.refreshToken();
      const { name, value } = getAuthorizationHeader(token);
      headers.set(name, value);
      return fetch(input, { ...init, headers });
    }

    return response;
  };
}
