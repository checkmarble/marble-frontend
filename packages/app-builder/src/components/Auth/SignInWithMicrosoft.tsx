import {
  AccountExistsWithDifferentCredential,
  InvalidLoginCredentials,
  NetworkRequestFailed,
  PopupBlockedByClient,
  useMicrosoftSignIn,
} from '@app-builder/services/auth/auth.client';
import { type AuthPayload } from '@app-builder/services/auth/auth.server';
import { useClientServices } from '@app-builder/services/init.client';
import useAsync from '@app-builder/utils/hooks/use-async';
import * as Sentry from '@sentry/remix';
import toast from 'react-hot-toast';
import { useTranslation } from 'react-i18next';
import { ClientOnly } from 'remix-utils/client-only';
import { Logo } from 'ui-icons';

import { Spinner } from '../Spinner';
import { PopupBlockedError } from './PopupBlockedError';

function SignInWithMicrosoftButton({
  onClick,
  loading,
}: {
  onClick?: () => void;
  loading?: boolean;
}) {
  const { t } = useTranslation(['auth']);

  return (
    <button
      className="relative flex h-10 w-full items-center justify-center rounded border border-grey-90 disabled:cursor-wait gap-2"
      onClick={() => {
        void onClick?.();
      }}
      disabled={loading}
    >
      <Logo logo="microsoft-logo" className="size-6" />
      <span className="text-s whitespace-nowrap text-center font-medium">
        {t('auth:sign_in.microsoft')}
      </span>
      <span className="absolute end-0 mx-2 size-4">
        {loading ? <Spinner className="size-4" /> : null}
      </span>
    </button>
  );
}

function ClientSignInWithMicrosoft({
  signIn,
  loading,
}: {
  signIn: (authPayload: AuthPayload) => void;
  loading?: boolean;
}) {
  const { t } = useTranslation(['common', 'auth']);
  const clientServices = useClientServices();

  const microsoftSignIn = useMicrosoftSignIn(clientServices.authenticationClientService);

  const [handleMicrosoftSignIn, _state] = useAsync(async () => {
    try {
      const result = await microsoftSignIn();
      if (!result) return;
      const { idToken, csrf } = result;
      if (!idToken) return;
      signIn({ type: 'microsoft', idToken, csrf });
    } catch (error) {
      if (error instanceof AccountExistsWithDifferentCredential) {
        toast.error(t('common:errors.account_exists_with_different_credential'));
      } else if (error instanceof PopupBlockedByClient) {
        toast.error(<PopupBlockedError />);
      } else if (error instanceof NetworkRequestFailed) {
        toast.error(t('common:errors.firebase_network_error'));
      } else if (error instanceof InvalidLoginCredentials) {
        toast.error(t('auth:sign_in.errors.invalid_login_credentials'));
      } else {
        Sentry.captureException(error);
        toast.error(t('common:errors.unknown'));
      }
    }
  });

  return (
    <SignInWithMicrosoftButton
      onClick={() => {
        void handleMicrosoftSignIn();
      }}
      // We can't rely on state.loading if the user closes the popup without signing in
      // Related Firebase issue: https://github.com/firebase/firebase-js-sdk/issues/8061
      loading={loading}
      // loading={loading || state.loading} when the issue is resolved
    />
  );
}

export function SignInWithMicrosoft({
  signIn,
  loading,
}: {
  signIn: (authPayload: AuthPayload) => void;
  loading?: boolean;
}) {
  return (
    <ClientOnly fallback={<SignInWithMicrosoftButton loading={loading} />}>
      {() => <ClientSignInWithMicrosoft signIn={signIn} loading={loading} />}
    </ClientOnly>
  );
}
