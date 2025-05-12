import type { Session } from '@remix-run/node';
import type { Token } from 'marble-api';

import type { CreatedApiKey } from './api-keys';
import type { AuthErrors } from './auth-errors';

export type AuthData = {
  authToken: Token;
};
export type AuthFlashData = {
  authError: { message: AuthErrors };
  createdApiKey: CreatedApiKey;
};
export type AuthSession = Session<AuthData, AuthFlashData>;
