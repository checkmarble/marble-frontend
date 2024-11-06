import {
  AccountExistsWithDifferentCredential,
  InvalidLoginCredentials,
  NetworkRequestFailed,
  PopupBlockedByClient,
  useGoogleSignIn,
} from '@app-builder/services/auth/auth.client';
import { type AuthPayload } from '@app-builder/services/auth/auth.server';
import { clientServices } from '@app-builder/services/init.client';
import useAsync from '@app-builder/utils/hooks/use-async';
import * as Sentry from '@sentry/remix';
import toast from 'react-hot-toast';
import { useTranslation } from 'react-i18next';
import { ClientOnly } from 'remix-utils/client-only';
import { Logo } from 'ui-icons';

import { Spinner } from '../Spinner';
import { PopupBlockedError } from './PopupBlockedError';

function SignInWithGoogleButton({
  onClick,
  loading,
}: {
  onClick?: () => void;
  loading?: boolean;
}) {
  const { t } = useTranslation(['auth']);

  return (
    <button
      className="relative flex h-10 w-full items-center rounded border-2 border-[#1a73e8] bg-[#1a73e8] transition hover:bg-[rgb(69,128,233)] disabled:cursor-wait"
      onClick={onClick}
      disabled={loading}
    >
      <div className="bg-grey-00 flex h-full w-10 shrink-0 items-center justify-center rounded-l-[3px]">
        <Logo logo="google-logo" className="size-6" />
      </div>
      <span className="text-s text-grey-00 w-full whitespace-nowrap text-center align-middle font-medium">
        {t('auth:sign_in.google')}
      </span>
      <span className="absolute right-0 mx-2 size-4">
        {loading ? <Spinner className="size-4" /> : null}
      </span>
    </button>
  );
}

function ClientSignInWithGoogle({
  signIn,
  loading,
}: {
  signIn: (authPayload: AuthPayload) => void;
  loading?: boolean;
}) {
  const { t } = useTranslation(['common']);
  const googleSignIn = useGoogleSignIn(
    clientServices.authenticationClientService,
  );

  const [handleGoogleSignIn, _state] = useAsync(async () => {
    try {
      const result = await googleSignIn();
      if (!result) return;
      const { idToken, csrf } = result;
      if (!idToken) return;
      signIn({ type: 'google', idToken, csrf });
    } catch (error) {
      if (error instanceof AccountExistsWithDifferentCredential) {
        toast.error(
          t('common:errors.account_exists_with_different_credential'),
        );
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
    <SignInWithGoogleButton
      onClick={() => {
        void handleGoogleSignIn();
      }}
      // We can't rely on state.loading if the user closes the popup without signing in
      // Related Firebase issue: https://github.com/firebase/firebase-js-sdk/issues/8061
      loading={loading}
      // loading={loading || state.loading} when the issue is resolved
    />
  );
}

export function SignInWithGoogle({
  signIn,
  loading,
}: {
  signIn: (authPayload: AuthPayload) => void;
  loading?: boolean;
}) {
  return (
    <ClientOnly fallback={<SignInWithGoogleButton loading={loading} />}>
      {() => <ClientSignInWithGoogle signIn={signIn} loading={loading} />}
    </ClientOnly>
  );
}
