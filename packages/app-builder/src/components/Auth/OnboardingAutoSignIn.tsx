/**
 * Signs the freshly-created admin in with the credentials they just chose during onboarding.
 *
 * This lives in its own component, rendered only after a successful submit, on purpose:
 * `useClientServices()` builds the Firebase client, and `getAuth` throws
 * `auth/invalid-api-key` when no API key is configured — which is the case on OIDC
 * instances, since `/config` reports Firebase settings regardless of the active provider.
 * A component rendered only in response to an interaction never runs on the server and
 * never mounts for OIDC, which is why no `ClientOnly` wrapper is needed here. Do not
 * inline this back into the onboarding route.
 *
 * Auto sign-in only works because the backend creates this first account pre-verified;
 * unverified password accounts are rejected when exchanging the Firebase token.
 */
import { signInEmailFn } from '@app-builder/server-fns/auth';
import {
  EmailUnverified,
  InvalidLoginCredentials,
  NetworkRequestFailed,
  useEmailAndPasswordSignIn,
} from '@app-builder/services/auth/auth-client';
import { useClientServices } from '@app-builder/services/init-client';
import * as Sentry from '@sentry/tanstackstart-react';
import { useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { Spinner } from '../Spinner';

export type AutoSignInFailure = 'credentials' | 'unverified' | 'unknown';

export function OnboardingAutoSignIn({
  email,
  password,
  onFailure,
}: {
  email: string;
  password: string;
  onFailure: (reason: AutoSignInFailure) => void;
}) {
  const { t } = useTranslation(['auth', 'common']);
  const clientServices = useClientServices();
  const emailAndPasswordSignIn = useEmailAndPasswordSignIn(clientServices.authenticationClientService);

  // Sign-in must happen exactly once. StrictMode double-invokes effects in development, and
  // `emailAndPasswordSignIn` starts by signing out of Firebase — so a second run would tear
  // down the session the first one just established.
  const startedRef = useRef(false);

  useEffect(() => {
    if (startedRef.current) return;
    startedRef.current = true;

    const signIn = async () => {
      const result = await emailAndPasswordSignIn(email, password);

      // Only reachable if a Firebase account with this email already existed and had MFA
      // enrolled. The sign-in page hosts that challenge properly, so hand off to it.
      if (result.mfaRequired) {
        onFailure('credentials');
        return;
      }

      const { redirectTo } = await signInEmailFn({
        data: { idToken: result.idToken, refreshToken: result.refreshToken, csrf: result.csrf },
      });

      // Full page load so the root loader picks up the now-initialized app config.
      window.location.href = redirectTo;
    };

    signIn().catch((error) => {
      if (error instanceof EmailUnverified) {
        onFailure('unverified');
      } else if (error instanceof InvalidLoginCredentials) {
        onFailure('credentials');
      } else if (error instanceof NetworkRequestFailed) {
        onFailure('unknown');
      } else {
        Sentry.captureException(error);
        onFailure('unknown');
      }
    });
  }, []);

  return (
    <div className="flex flex-col items-center gap-lg py-xl">
      <Spinner className="size-6" />
      <p className="text-s text-grey-secondary">{t('auth:onboarding.signing_in')}</p>
    </div>
  );
}
