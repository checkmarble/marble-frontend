import { type Token } from '@marble-api';
import { type Session } from '@remix-run/node';
import * as z from 'zod';

import { type AuthErrors } from './auth-errors';

export const toastMessageScema = z.object({
  type: z.enum(['success', 'error', 'loading', 'custom']),
  messageKey: z.enum([
    'common:errors.unknown',
    'common:empty_scenario_iteration_list',
    'common:errors.edit.forbidden_not_draft',
    'common:errors.list.duplicate_list_name',
  ]),
});

export type ToastMessage = z.infer<typeof toastMessageScema>;

export type MarbleSessionData = { authToken: Token; lng: string };
export type MarbleFlashData = {
  toastMessage: ToastMessage;
  authError: { message: AuthErrors };
};
export type MarbleSession = Session<MarbleSessionData, MarbleFlashData>;
