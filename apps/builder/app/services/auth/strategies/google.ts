import { type StrategyVerifyCallback } from 'remix-auth';
import {
  type OAuth2Profile,
  OAuth2Strategy,
  type OAuth2StrategyVerifyParams,
} from 'remix-auth-oauth2';

export type GoogleScope = 'openid' | 'email' | 'profile';
export const GoogleScopeSeperator = ' ';
export const GoogleDefaultScopes: GoogleScope[] = [
  'openid',
  'profile',
  'email',
];

export interface GoogleStrategyOptions {
  clientID: string;
  clientSecret: string;
  callbackURL: string;
  /**
   * @default "openid profile email"
   */
  scope?: GoogleScope[];
  accessType?: 'online' | 'offline';
  includeGrantedScopes?: boolean;
  prompt?: 'none' | 'consent' | 'select_account';
  hd?: string;
  loginHint?: string;
}

export interface GoogleProfile extends OAuth2Profile {
  id: string;
  displayName: string;
  name: {
    familyName: string;
    givenName: string;
  };
  emails: [{ value: string }];
  photos: [{ value: string }];
  _json: {
    sub: string;
    name: string;
    given_name: string;
    family_name: string;
    picture: string;
    locale: string;
    email: string;
    email_verified: boolean;
    hd: string;
  };
}

export interface GoogleExtraParams extends Record<string, string | number> {
  expires_in: 3920;
  token_type: 'Bearer';
  scope: string;
  id_token: string;
}

export class GoogleStrategy<User> extends OAuth2Strategy<
  User,
  GoogleProfile,
  GoogleExtraParams
> {
  public name = 'google';

  private readonly scope: GoogleScope[];

  private readonly accessType: string;

  private readonly prompt?: 'none' | 'consent' | 'select_account';

  private readonly includeGrantedScopes: boolean;

  private readonly hd?: string;

  private readonly loginHint?: string;

  private readonly userInfoURL =
    'https://www.googleapis.com/oauth2/v3/userinfo';

  constructor(
    {
      clientID,
      clientSecret,
      callbackURL,
      scope,
      accessType,
      includeGrantedScopes,
      prompt,
      hd,
      loginHint,
    }: GoogleStrategyOptions,
    verify: StrategyVerifyCallback<
      User,
      OAuth2StrategyVerifyParams<GoogleProfile, GoogleExtraParams>
    >
  ) {
    super(
      {
        clientID,
        clientSecret,
        callbackURL,
        authorizationURL: 'https://accounts.google.com/o/oauth2/v2/auth',
        tokenURL: 'https://oauth2.googleapis.com/token',
      },
      verify
    );
    this.scope = scope || GoogleDefaultScopes;
    this.accessType = accessType ?? 'online';
    this.includeGrantedScopes = includeGrantedScopes ?? false;
    this.prompt = prompt;
    this.hd = hd;
    this.loginHint = loginHint;
  }

  protected authorizationParams(): URLSearchParams {
    const params = new URLSearchParams({
      scope: this.scope.join(GoogleScopeSeperator),
      access_type: this.accessType,
      include_granted_scopes: String(this.includeGrantedScopes),
    });
    if (this.prompt) {
      params.set('prompt', this.prompt);
    }
    if (this.hd) {
      params.set('hd', this.hd);
    }
    if (this.loginHint) {
      params.set('login_hint', this.loginHint);
    }
    return params;
  }

  protected async userProfile(accessToken: string): Promise<GoogleProfile> {
    const response = await fetch(this.userInfoURL, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });
    const raw: GoogleProfile['_json'] = await response.json();
    const profile: GoogleProfile = {
      provider: this.name,
      id: raw.sub,
      displayName: raw.name,
      name: {
        familyName: raw.family_name,
        givenName: raw.given_name,
      },
      emails: [{ value: raw.email }],
      photos: [{ value: raw.picture }],
      _json: raw,
    };
    return profile;
  }
}
