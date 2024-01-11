import { useSendSignInLink } from '@app-builder/services/auth/auth.client';
import { clientServices } from '@app-builder/services/init.client';
import { useCallbackRef } from '@app-builder/utils/hooks';
import * as Sentry from '@sentry/remix';
import clsx from 'clsx';
import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { Trans, useTranslation } from 'react-i18next';
import { ClientOnly } from 'remix-utils/client-only';
import { Button, Modal } from 'ui-design-system';
import { Icon } from 'ui-icons';

function SendSignInLinkIcon({ className }: { className?: string }) {
  const { t } = useTranslation(['settings']);

  return (
    <Icon
      icon="mail"
      className={clsx('size-6 shrink-0', className)}
      aria-label={t('settings:users.email_link.title')}
    />
  );
}

function ClientSendSignInLink({ email }: { email: string }) {
  const { t } = useTranslation(['settings', 'common']);
  const [open, setOpen] = useState(false);

  const sendSignInLink = useSendSignInLink(
    clientServices.authenticationClientService,
  );

  async function onSendClick() {
    try {
      await sendSignInLink(email);
      setOpen(false);
    } catch (error) {
      Sentry.captureException(error);
      toast.error(t('common:errors.unknown'));
    }
  }

  return (
    <Modal.Root open={open} onOpenChange={setOpen}>
      <Modal.Trigger>
        <SendSignInLinkIcon />
      </Modal.Trigger>
      <Modal.Content onClick={(e) => e.stopPropagation()}>
        <Modal.Title>{t('settings:users.email_link.title')}</Modal.Title>
        <div className="flex flex-col gap-6 p-6">
          <Modal.Description className="text-m text-grey-100 text-center">
            <Trans
              t={t}
              i18nKey="settings:users.email_link.description"
              components={{
                Email: <span className="font-bold underline" />,
              }}
              values={{
                email,
              }}
            />
          </Modal.Description>
          <div className="flex flex-1 flex-row gap-2">
            <Modal.Close asChild>
              <Button className="flex-1" variant="secondary" name="cancel">
                {t('common:cancel')}
              </Button>
            </Modal.Close>
            <Button
              className="flex-1"
              variant="primary"
              onClick={() => {
                void onSendClick();
              }}
            >
              {t('settings:users.email_link.send')}
            </Button>
          </div>
        </div>
      </Modal.Content>
    </Modal.Root>
  );
}

export function SendSignInLink({ email }: { email: string }) {
  return (
    <ClientOnly
      fallback={
        <SendSignInLinkIcon className="text-grey-50 cursor-not-allowed" />
      }
    >
      {() => <ClientSendSignInLink email={email} />}
    </ClientOnly>
  );
}

function ClientAutomaticSendSignInLink({
  email,
  onSend,
}: {
  email: string | null;
  onSend: () => void;
}) {
  const { t } = useTranslation(['settings']);
  const sendSignInLink = useSendSignInLink(
    clientServices.authenticationClientService,
  );

  const automaticallySendSignInLink = useCallbackRef(async (email: string) => {
    try {
      await sendSignInLink(email);
      onSend();
    } catch (error) {
      Sentry.captureException(error);
      toast.error(t('settings:users.email_link.automatically_send_error'));
    }
  });

  useEffect(() => {
    if (!email) return;
    void automaticallySendSignInLink(email);
  }, [email, automaticallySendSignInLink]);

  return null;
}

/**
 * This is a hack: since the user creation is done on the server, and the email link can only be done on the browser.
 * Caveat due to Firebase
 */
export function AutomaticSendSignInLink(props: {
  email: string | null;
  onSend: () => void;
}) {
  return (
    <ClientOnly>
      {() => <ClientAutomaticSendSignInLink {...props} />}
    </ClientOnly>
  );
}
