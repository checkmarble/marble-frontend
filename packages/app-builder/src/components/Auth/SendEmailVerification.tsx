import { useResendEmailVerification } from '@app-builder/services/auth/auth.client';
import { clientServices } from '@app-builder/services/init.client';
import { getRoute } from '@app-builder/utils/routes';
import { useNavigate } from '@remix-run/react';
import * as Sentry from '@sentry/remix';
import toast from 'react-hot-toast';
import { useTranslation } from 'react-i18next';
import { ClientOnly } from 'remix-utils/client-only';
import { useHydrated } from 'remix-utils/use-hydrated';
import { Button } from 'ui-design-system';

function SendEmailVerificationButton({ onClick }: { onClick?: () => void }) {
  const { t } = useTranslation(['auth']);
  const isHydrated = useHydrated();

  return (
    <Button
      variant="primary"
      className="w-full capitalize"
      onClick={onClick}
      disabled={!isHydrated}
    >
      {t('auth:email-verification.resend')}
    </Button>
  );
}

function ClientSendEmailVerificationButton() {
  const { t } = useTranslation(['common']);

  const resendEmailVerification = useResendEmailVerification(
    clientServices.authenticationClientService,
  );

  const navigate = useNavigate();
  async function onSendClick() {
    try {
      const logout = () => navigate(getRoute('/ressources/auth/logout'));
      await resendEmailVerification(logout);
    } catch (error) {
      Sentry.captureException(error);
      toast.error(t('common:errors.unknown'));
    }
  }

  return (
    <SendEmailVerificationButton
      onClick={() => {
        void onSendClick();
      }}
    />
  );
}

export function SendEmailVerification() {
  return (
    <ClientOnly fallback={<SendEmailVerificationButton />}>
      {() => <ClientSendEmailVerificationButton />}
    </ClientOnly>
  );
}
