import { type Session } from '@remix-run/node';
import * as z from 'zod';

export const toastMessageScema = z.object({
  type: z.enum(['success', 'error', 'loading', 'custom']),
  messageKey: z.enum([
    'common:errors.unknown',
    'common:empty_scenario_iteration_list',
    'common:errors.edit.forbidden_not_draft',
    'common:errors.list.duplicate_list_name',
    'common:errors.data.duplicate_field_name',
    'common:errors.data.duplicate_table_name',
    'common:errors.data.duplicate_link_name',
    'common:errors.create_case.invalid',
    'common:success.save',
    'common:errors.draft.invalid',
  ]),
});

export type ToastMessage = z.infer<typeof toastMessageScema>;

export type ToastSessionData = void;
export type ToastFlashData = {
  toastMessage: ToastMessage;
};
export type ToastSession = Session<ToastSessionData, ToastFlashData>;
