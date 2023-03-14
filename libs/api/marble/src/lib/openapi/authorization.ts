import { Mutex } from 'async-mutex';
import { type Middleware } from '../generated/marble-api';

export class TokenService<Token> {
  private _token: Promise<Token>;
  private _refreshToken: () => Promise<Token>;
  private pendingRefreshMutex: Mutex = new Mutex();

  constructor(args: { refreshToken: () => Promise<Token> }) {
    this._refreshToken = args.refreshToken;
    this._token = args.refreshToken();
  }

  public async getToken() {
    return this.pendingRefreshMutex.waitForUnlock().then(() => this._token);
  }

  public async refreshToken() {
    if (this.pendingRefreshMutex.isLocked()) return;

    const release = await this.pendingRefreshMutex.acquire();
    try {
      this._token = this._refreshToken();
    } finally {
      release();
    }
  }
}

export function getAuthorizationMiddleware<Token>({
  bffTokenService,
  getAuthorizationHeader,
}: {
  bffTokenService: TokenService<Token>;
  getAuthorizationHeader: (token: Token) => { name: string; value: string };
}): Middleware {
  return {
    pre: async ({ url, init }) => {
      const token = await bffTokenService.getToken();
      const { name, value } = getAuthorizationHeader(token);
      const headers = new Headers(init.headers);
      headers.set(name, value);

      return {
        url,
        init: {
          ...init,
          headers,
        },
      };
    },
    post: async ({ fetch, url, init, response }) => {
      if (response.status === 401) {
        await bffTokenService.refreshToken();

        return fetch(url, init);
      }
      return response;
    },
  };
}
