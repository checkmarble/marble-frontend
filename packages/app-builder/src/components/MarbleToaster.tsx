import { useEffect } from 'react';
import { toast, Toaster } from 'react-hot-toast';
import { useTranslation } from 'react-i18next';
import * as z from 'zod';

import { type MarbleSession } from '../services/auth/session.server';

const toastMessageScema = z.object({
  type: z.enum(['success', 'error', 'loading', 'custom']),
  messageKey: z.enum([
    'common:errors.unknown',
    'common:empty_scenario_iteration_list',
  ]),
});

export type ToastMessage = z.infer<typeof toastMessageScema>;

export function setToastMessage(
  session: MarbleSession,
  toastMessage: ToastMessage
) {
  session.flash('toastMessage', toastMessage);
}

export function getToastMessage(session: MarbleSession) {
  try {
    return toastMessageScema.parse(session.get('toastMessage'));
  } catch (err) {}
}

export function MarbleToaster({
  toastMessage,
}: {
  toastMessage?: ToastMessage;
}) {
  const { t } = useTranslation(['common']);
  useEffect(() => {
    if (!toastMessage) {
      return;
    }
    toast[toastMessage.type](t(toastMessage.messageKey));
  }, [t, toastMessage]);

  return <Toaster position="bottom-center" />;
}
