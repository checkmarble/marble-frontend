import { type Session } from '@remix-run/node';
import { type Token } from 'marble-api';

import { type CreatedApiKey } from './api-keys';
import { type AuthErrors } from './auth-errors';
import { type LicenseEntitlements } from './license';
import { type CurrentUser } from './user';

export type AuthData = {
  authToken: Token;
  user: CurrentUser;
  entitlements: LicenseEntitlements;
};
export type AuthFlashData = {
  authError: { message: AuthErrors };
  createdApiKey: CreatedApiKey;
};
export type AuthSession = Session<AuthData, AuthFlashData>;
