import { toast, Toaster } from 'react-hot-toast';
import type { Session } from '@remix-run/node';
import { useEffect } from 'react';
import * as z from 'zod';
import { useTranslation } from 'react-i18next';

const toastMessageKey = 'toastMessage' as const;

const toastMessageScema = z.object({
  type: z.enum(['success', 'error', 'loading', 'custom']),
  messageKey: z.enum([
    'common:errors.unknown',
    'common:errors.deployment.version_id_currently_deployed',
  ]),
});

type ToastMessage = z.infer<typeof toastMessageScema>;

export async function setToastMessage(
  session: Session,
  toastMessage: ToastMessage
) {
  session.flash(toastMessageKey, toastMessage);
}

export function getToastMessage(session: Session) {
  try {
    return toastMessageScema.parse(session.get(toastMessageKey));
  } catch (err) {
    return null;
  }
}

export function MarbleToaster({
  toastMessage,
}: {
  toastMessage: ToastMessage;
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
