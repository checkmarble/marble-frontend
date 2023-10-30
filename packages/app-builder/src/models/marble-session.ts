import { type Session } from '@remix-run/node';
import { type Token } from 'marble-api';

import { type AuthErrors } from './auth-errors';
import { type User } from './user';

export type AuthData = { authToken: Token; lng: string; user: User };
export type AuthFlashData = {
  authError: { message: AuthErrors };
};
export type AuthSession = Session<AuthData, AuthFlashData>;
