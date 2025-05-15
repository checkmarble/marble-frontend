import type { Session } from '@remix-run/node';
import * as z from 'zod';

/**
 * @param messageKey translation key for the message
 *
 * @deprecated use `newToastMessageSchema` instead
 */
const oldToastMessageSchema = z.object({
  type: z.enum(['success', 'error', 'loading', 'custom']),
  messageKey: z.enum([
    'common:errors.unknown',
    'common:errors.account_exists_with_different_credential',
    'common:empty_scenario_iteration_list',
    'common:errors.edit.forbidden_not_draft',
    'common:errors.list.duplicate_list_name',
    'common:errors.list.duplicate_email',
    'common:errors.data.duplicate_field_name',
    'common:errors.data.duplicate_test_run',
    'common:errors.data.duplicate_table_name',
    'common:errors.data.duplicate_link_name',
    'common:errors.add_to_case.invalid',
    'common:success.save',
    'common:success.add_to_case',
  ]),
});

/**
 * @param message the translated message
 */
const newToastMessageSchema = z.object({
  type: z.enum(['success', 'error', 'loading', 'custom']),
  message: z.string(),
});

export const toastMessageSchema = z.union([oldToastMessageSchema, newToastMessageSchema]);

export type NewToastMessage = z.infer<typeof newToastMessageSchema>;
export function isNewToastMessage(message: ToastMessage): message is NewToastMessage {
  return Object.hasOwn(message, 'message');
}

export type ToastMessage = z.infer<typeof toastMessageSchema>;

export type ToastSessionData = void;
export type ToastFlashData = {
  toastMessage: ToastMessage;
};
export type ToastSession = Session<ToastSessionData, ToastFlashData>;
