import { type AuthPayload } from '@app-builder/services/auth/auth.server';
import {
  AccountExistsWithDifferentCredential,
  InvalidLoginCredentials,
  NetworkRequestFailed,
  PopupBlockedByClient,
  useGoogleSignIn,
} from '@app-builder/services/auth/auth-client';
import { useClientServices } from '@app-builder/services/init-client';
import useAsync from '@app-builder/utils/hooks/use-async';
import * as Sentry from '@sentry/tanstackstart-react';
import { ClientOnly } from '@tanstack/react-router';
import { type MultiFactorResolver } from 'firebase/auth';
import toast from 'react-hot-toast';
import { useTranslation } from 'react-i18next';
import { Button } from 'ui-design-system';
import { Logo } from 'ui-icons';
import { Spinner } from '../Spinner';
import { PopupBlockedError } from './PopupBlockedError';

function SignInWithGoogleButton({ onClick, loading }: { onClick?: () => void; loading?: boolean }) {
  const { t } = useTranslation(['auth']);

  return (
    <Button
      variant="secondary"
      color="grey"
      size="large"
      appearance="stroked"
      className="w-full justify-center gap-sm relative"
      onClick={onClick}
      disabled={loading}
    >
      <Logo logo="google-logo" className="size-6" />
      <span className="text-s whitespace-nowrap text-center font-medium">{t('auth:sign_in.google')}</span>
      <span className="absolute end-0 mx-sm size-4">{loading ? <Spinner className="size-4" /> : null}</span>
    </Button>
  );
}

function ClientSignInWithGoogle({
  signIn,
  onMfaRequired,
  loading,
}: {
  signIn: (authPayload: AuthPayload) => void;
  onMfaRequired: (resolver: MultiFactorResolver) => void;
  loading?: boolean;
}) {
  const { t } = useTranslation(['common', 'auth']);
  const clientServices = useClientServices();

  const googleSignIn = useGoogleSignIn(clientServices.authenticationClientService);

  const [handleGoogleSignIn, _state] = useAsync(async () => {
    try {
      const result = await googleSignIn();
      if (!result) return;
      if (result.mfaRequired) {
        onMfaRequired(result.resolver);
        return;
      }
      signIn({ type: 'google', idToken: result.idToken, refreshToken: result.refreshToken, csrf: result.csrf });
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
  onMfaRequired,
  loading,
}: {
  signIn: (authPayload: AuthPayload) => void;
  onMfaRequired: (resolver: MultiFactorResolver) => void;
  loading?: boolean;
}) {
  return (
    <ClientOnly fallback={<SignInWithGoogleButton loading={loading} />}>
      <ClientSignInWithGoogle signIn={signIn} onMfaRequired={onMfaRequired} loading={loading} />
    </ClientOnly>
  );
}
