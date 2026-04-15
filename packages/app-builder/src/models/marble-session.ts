import { type Token } from 'marble-api';

import { type CreatedApiKey } from './api-keys';
import { type AuthErrors } from './auth-errors';

export type AuthData = {
  authToken: Token;
  refreshToken: string;
};
export type AuthFlashData = {
  authError: { message: AuthErrors };
  createdApiKey: CreatedApiKey;
};
