import { useAgnosticNavigation } from '@app-builder/contexts/AgnosticNavigationContext';
import {
  NetworkRequestFailed,
  TooManyRequest,
  useResendEmailVerification,
} from '@app-builder/services/auth/auth.client';
import { useClientServices } from '@app-builder/services/init.client';
import { getRoute } from '@app-builder/utils/routes';
import * as Sentry from '@sentry/remix';
import toast from 'react-hot-toast';
import { Trans, useTranslation } from 'react-i18next';
import { ClientOnly } from 'remix-utils/client-only';
import { useHydrated } from 'remix-utils/use-hydrated';
import { Button } from 'ui-design-system';

function SendEmailVerificationButton({ onClick, children }: { onClick?: () => void; children: React.ReactNode }) {
  const isHydrated = useHydrated();

  return (
    <Button variant="secondary" className="w-full capitalize" onClick={onClick} disabled={!isHydrated}>
      {children}
    </Button>
  );
}

function ClientSendEmailVerificationButton() {
  const { t } = useTranslation(['common', 'auth']);
  const clientServices = useClientServices();

  const { isFirebaseEmulator } = clientServices.authenticationClientService.authenticationClientRepository;
  const resendEmailVerification = useResendEmailVerification(clientServices.authenticationClientService);

  const navigate = useAgnosticNavigation();
  async function onSendClick() {
    try {
      const logout = () => navigate(getRoute('/ressources/auth/logout'));
      await resendEmailVerification(logout);
    } catch (error) {
      if (error instanceof NetworkRequestFailed) {
        toast.error(t('common:errors.firebase_network_error'));
      } else if (error instanceof TooManyRequest) {
        toast.error(t('common:errors.too_many_requests'));
      } else {
        Sentry.captureException(error);
        toast.error(t('common:errors.unknown'));
      }
    }
  }

  return (
    <SendEmailVerificationButton
      onClick={() => {
        void onSendClick();
      }}
    >
      {isFirebaseEmulator ? t('auth:email-verification.emulator_resend') : t('auth:email-verification.resend')}
    </SendEmailVerificationButton>
  );
}

export function SendEmailVerification() {
  const { t } = useTranslation(['auth']);
  return (
    <ClientOnly
      fallback={<SendEmailVerificationButton>{t('auth:email-verification.resend')}</SendEmailVerificationButton>}
    >
      {() => <ClientSendEmailVerificationButton />}
    </ClientOnly>
  );
}

function ClientSendEmailVerificationDescription() {
  const { t } = useTranslation(['auth']);
  const clientServices = useClientServices();

  const { isFirebaseEmulator } = clientServices.authenticationClientService.authenticationClientRepository;

  return (
    <Trans
      t={t}
      i18nKey={
        isFirebaseEmulator ? 'auth:email-verification.emulator_description' : 'auth:email-verification.description'
      }
    />
  );
}

export function SendEmailVerificationDescription() {
  const { t } = useTranslation(['auth']);
  return (
    <ClientOnly fallback={<Trans t={t} i18nKey="auth:email-verification.description" />}>
      {() => <ClientSendEmailVerificationDescription />}
    </ClientOnly>
  );
}
