import type { AppConfig } from '@app-builder/models/app-config';
import { createSignedCookie } from '@app-builder/repositories/SessionStorageRepositories/signed-cookie';
import { getServerEnv } from '@app-builder/utils/environment';
import { CodeChallengeMethod, generateCodeVerifier, generateState, OAuth2Client, OAuth2Tokens } from 'arctic';
import type { Tokens } from '../../routes/oidc/auth';

interface OidcDiscovery {
  authorization_endpoint: string;
  token_endpoint: string;
}

let discoveryCache: OidcDiscovery | undefined;

async function getOidcDiscovery(issuer: string): Promise<OidcDiscovery> {
  if (discoveryCache) return discoveryCache;
  const res = await fetch(`${issuer}/.well-known/openid-configuration`);
  discoveryCache = (await res.json()) as OidcDiscovery;
  return discoveryCache;
}

export function getOauth2Cookie({ secrets, secure }: { secrets: string[]; secure: boolean }) {
  return createSignedCookie({
    name: 'oauth2',
    path: '/',
    httpOnly: true,
    sameSite: 'lax',
    secrets,
    secure,
  });
}

export async function makeOidcService(config: AppConfig) {
  const apiUrl = getServerEnv('MARBLE_API_URL');
  const { client_id, redirect_uri, scopes, issuer, extra_params } = config.auth.oidc;

  const discovery = await getOidcDiscovery(issuer);
  // Override token endpoint to use marble API proxy (same as old service)
  const tokenEndpoint = `${apiUrl}/oidc/token`;
  const client = new OAuth2Client(client_id, null, redirect_uri);

  return {
    buildAuthorizationUrl: async (): Promise<{
      url: string;
      state: string;
      codeVerifier: string;
    }> => {
      const state = generateState();
      const codeVerifier = generateCodeVerifier();
      const url = await client.createAuthorizationURLWithPKCE(
        discovery.authorization_endpoint,
        state,
        CodeChallengeMethod.S256,
        codeVerifier,
        scopes,
      );
      for (const [key, value] of Object.entries(extra_params)) {
        url.searchParams.set(key, value);
      }
      return { url: url.toString(), state, codeVerifier };
    },

    refreshToken: async (refreshToken: string) => {
      return client.refreshAccessToken(tokenEndpoint, refreshToken, scopes);
    },

    exchangeCode: async (code: string, codeVerifier: string): Promise<Tokens> => {
      const rawTokens = await client.validateAuthorizationCode(tokenEndpoint, code, codeVerifier);
      const tokens = new CompatOAuth2Tokens(rawTokens.data);
      return {
        sub: 'DOES NOT MATTER',
        accessToken: tokens.accessToken() ?? '',
        refreshToken: tokens.hasRefreshToken() ? tokens.refreshToken() : '',
        idToken: tokens.idToken(),
        expiredAt: tokens.accessTokenExpiresAt().getTime() ?? 0,
      };
    },
  };
}

//
// Some OpenID Connect providers do not follow the specification. This class
// extends the one we receive from the IDP to implement more relaxed parsing
// methods in order to accept more kinds of responses.
//
class CompatOAuth2Tokens extends OAuth2Tokens {
  // Microsoft Azure's implementation of OpenID Connect sends the `expires_in`
  // field as a stringified integer, instead of a real integer. This breaks our
  // library, we therefore override their functions in order to parse it anyway.
  override accessTokenExpiresInSeconds(): number {
    if ('expires_in' in this.data) {
      if (typeof this.data.expires_in === 'number') {
        return this.data.expires_in;
      }

      if (typeof this.data.expires_in === 'string') {
        const n = parseInt(this.data.expires_in);
        if (!isNaN(n)) return n;
      }
    }

    throw new Error("Missing or invalid 'expires_in' field");
  }
}
