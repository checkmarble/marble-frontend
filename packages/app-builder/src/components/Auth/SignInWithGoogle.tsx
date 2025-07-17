import {
  AccountExistsWithDifferentCredential,
  InvalidLoginCredentials,
  NetworkRequestFailed,
  PopupBlockedByClient,
  useGoogleSignIn,
} from '@app-builder/services/auth/auth.client';
import { type AuthPayload } from '@app-builder/services/auth/auth.server';
import { useClientServices } from '@app-builder/services/init.client';
import { TranslationObject } from '@app-builder/types/i18n';
import useAsync from '@app-builder/utils/hooks/use-async';
import * as Sentry from '@sentry/remix';
import toast from 'react-hot-toast';
import { ClientOnly } from 'remix-utils/client-only';
import { Logo } from 'ui-icons';

import { Spinner } from '../Spinner';
import { PopupBlockedError } from './PopupBlockedError';

function SignInWithGoogleButton({
  onClick,
  loading,
  translationObject,
}: {
  onClick?: () => void;
  loading?: boolean;
  translationObject: TranslationObject<['auth', 'common']>;
}) {
  const { tAuth } = translationObject;

  return (
    <button
      className="relative flex h-10 w-full items-center rounded border-2 border-[#1a73e8] bg-[#1a73e8] transition hover:bg-[rgb(69,128,233)] disabled:cursor-wait"
      onClick={onClick}
      disabled={loading}
    >
      <div className="bg-grey-100 flex h-full w-10 shrink-0 items-center justify-center rounded-s-[3px]">
        <Logo logo="google-logo" className="size-6" />
      </div>
      <span className="text-s text-grey-100 w-full whitespace-nowrap text-center align-middle font-medium">
        {tAuth('sign_in.google')}
      </span>
      <span className="absolute end-0 mx-2 size-4">
        {loading ? <Spinner className="size-4" translationObject={translationObject} /> : null}
      </span>
    </button>
  );
}

function ClientSignInWithGoogle({
  signIn,
  loading,
  translationObject,
}: {
  signIn: (authPayload: AuthPayload) => void;
  loading?: boolean;
  translationObject: TranslationObject<['auth', 'common']>;
}) {
  const { tAuth, tCommon } = translationObject;
  const clientServices = useClientServices();

  const googleSignIn = useGoogleSignIn(clientServices.authenticationClientService);

  const [handleGoogleSignIn, _state] = useAsync(async () => {
    try {
      const result = await googleSignIn();
      if (!result) return;
      const { idToken, csrf } = result;
      if (!idToken) return;
      signIn({ type: 'google', idToken, csrf });
    } catch (error) {
      if (error instanceof AccountExistsWithDifferentCredential) {
        toast.error(tCommon('errors.account_exists_with_different_credential'));
      } else if (error instanceof PopupBlockedByClient) {
        toast.error(<PopupBlockedError translationObject={translationObject} />);
      } else if (error instanceof NetworkRequestFailed) {
        toast.error(tCommon('errors.firebase_network_error'));
      } else if (error instanceof InvalidLoginCredentials) {
        toast.error(tAuth('sign_in.errors.invalid_login_credentials'));
      } else {
        Sentry.captureException(error);
        toast.error(tCommon('errors.unknown'));
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
      translationObject={translationObject}
      // loading={loading || state.loading} when the issue is resolved
    />
  );
}

export function SignInWithGoogle({
  signIn,
  loading,
  translationObject,
}: {
  signIn: (authPayload: AuthPayload) => void;
  loading?: boolean;
  translationObject: TranslationObject<['auth', 'common']>;
}) {
  return (
    <ClientOnly
      fallback={<SignInWithGoogleButton loading={loading} translationObject={translationObject} />}
    >
      {() => (
        <ClientSignInWithGoogle
          signIn={signIn}
          loading={loading}
          translationObject={translationObject}
        />
      )}
    </ClientOnly>
  );
}
