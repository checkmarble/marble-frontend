import { AppConfig } from '@app-builder/models/app-config';
import { Tokens } from '@app-builder/routes/oidc+/auth';
import { getServerEnv } from '@app-builder/utils/environment';
import { OAuth2Tokens } from 'arctic';
import { OAuth2Strategy } from 'remix-auth-oauth2';

let oidcStrategy: MarbleOidcStrategy<Tokens> | undefined = undefined;

export class MarbleOidcStrategy<U> extends OAuth2Strategy<U> {
  extraParams: { [key: string]: string } = {};

  override authorizationParams(searchParams: URLSearchParams, request: Request) {
    for (let [key, value] of Object.entries(this.extraParams)) {
      searchParams.set(key, value);
    }

    return searchParams;
  }
}

export const makeOidcService = async (config: AppConfig) => {
  if (oidcStrategy) {
    return oidcStrategy;
  }

  const apiUrl = getServerEnv('MARBLE_API_URL');

  oidcStrategy = (await MarbleOidcStrategy.discover(
    config.auth.oidc.issuer,
    {
      tokenEndpoint: `${apiUrl}/oidc/token`,
      cookie: 'oauth2',
      clientId: config.auth.oidc.client_id,
      clientSecret: null,
      redirectURI: config.auth.oidc.redirect_uri,
      scopes: config.auth.oidc.scopes,
    },
    async ({ tokens: rawTokens }): Promise<Tokens> => {
      const tokens: CompatOAuth2Tokens = new CompatOAuth2Tokens(rawTokens.data);

      const credentials: Tokens = {
        sub: 'DOES NOT MATTER',
        accessToken: tokens.accessToken() ?? '',
        refreshToken: tokens.hasRefreshToken() ? tokens.refreshToken() : '',
        idToken: tokens.idToken(),
        expiredAt: (tokens as CompatOAuth2Tokens).accessTokenExpiresAt().getTime() ?? 0,
      };

      return credentials;
    },
  )) as MarbleOidcStrategy<Tokens>;

  oidcStrategy.extraParams = config.auth.oidc.extra_params;

  return oidcStrategy;
};

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
        const expiresInInt = parseInt(this.data.expires_in);

        if (!isNaN(expiresInInt) && expiresInInt.toString() === this.data.expires_in) {
          return expiresInInt;
        }

        return expiresInInt;
      }
    }

    throw new Error("Missing or invalid 'expires_in' field");
  }
}
