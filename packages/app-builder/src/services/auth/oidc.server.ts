import { AppConfigRepository } from '@app-builder/repositories/AppConfigRepository';
import { Tokens } from '@app-builder/routes/oidc+/auth';
import { getServerEnv } from '@app-builder/utils/environment';
import { OAuth2Strategy } from 'remix-auth-oauth2';

let oidcStrategy: MarbleOidcStrategy<Tokens> | undefined = undefined;

class MarbleOidcStrategy<U> extends OAuth2Strategy<U> {
  extraParams: { [key: string]: string } = {};

  override authorizationParams(searchParams: URLSearchParams, request: Request) {
    for (let [key, value] of Object.entries(this.extraParams)) {
      searchParams.set(key, value);
    }

    return searchParams;
  }
}

export const makeOidcService = async (configRepository: AppConfigRepository) => {
  if (oidcStrategy) {
    return oidcStrategy;
  }

  const config = await configRepository.getAppConfig();

  oidcStrategy = (await MarbleOidcStrategy.discover(
    config.auth.oidc.issuer,
    {
      cookie: 'oauth2',
      clientId: config.auth.oidc.client_id,
      clientSecret: getServerEnv('OIDC_CLIENT_SECRET'),
      redirectURI: config.auth.oidc.redirect_uri,
      scopes: config.auth.oidc.scopes,
    },
    async ({ tokens }): Promise<Tokens> => {
      const credentials: Tokens = {
        sub: 'DOES NOT MATTER',
        accessToken: tokens.accessToken() ?? '',
        refreshToken: tokens.hasRefreshToken() ? tokens.refreshToken() : '',
        idToken: tokens.idToken(),
        expiredAt: tokens.accessTokenExpiresAt().getTime() ?? 0,
      };

      return credentials;
    },
  )) as MarbleOidcStrategy<Tokens>;

  oidcStrategy.extraParams = config.auth.oidc.extra_params;

  return oidcStrategy;
};
