import { useFirebase } from '@bo/hooks/useFirebase';
import { signinFn } from '@bo/server-fns/auth';
import { ClientOnly, createFileRoute } from '@tanstack/react-router';
import { useServerFn } from '@tanstack/react-start';
import { useState } from 'react';
import { Button } from 'ui-design-system';
import { Icon, Logo } from 'ui-icons';

export const Route = createFileRoute('/_app/_public/sign-in')({
  component: RouteComponent,
});

function RouteComponent() {
  return (
    <main className="bg-grey-background text-grey-primary flex min-h-screen flex-col items-center justify-center p-lg">
      <section className="animate-launchpad-rise bg-surface-card border-grey-border flex w-full max-w-sm flex-col gap-xl rounded-xl border p-xl shadow-lg">
        {/* Brand lockup — the signal that this is the internal console, not the customer app */}
        <div className="flex flex-col gap-lg">
          <div className="flex items-center gap-sm">
            <Logo logo="logo-standard" className="text-grey-primary h-7" aria-label="Marble" />
            <span className="bg-grey-background text-grey-secondary rounded-md px-sm py-2xs text-2xs font-semibold uppercase tracking-wider">
              Backoffice
            </span>
          </div>
          <div className="flex flex-col gap-xs">
            <h1 className="text-l text-grey-primary font-semibold">Sign in to the operator console</h1>
            <p className="text-grey-secondary text-s">
              Internal tool for Checkmarble staff. Use your Checkmarble Google account to continue.
            </p>
          </div>
        </div>

        <ClientOnly fallback={<GoogleButton disabled />}>
          <GoogleSignIn />
        </ClientOnly>

        <p className="text-grey-secondary flex items-center gap-xs text-xs">
          <Icon icon="lock" className="size-3.5 shrink-0" />
          Staff access only — sign-in activity is recorded.
        </p>
      </section>
    </main>
  );
}

/* --------------------------------- Sign in --------------------------------- */

const FIREBASE_ERROR_COPY: Record<string, string> = {
  'auth/popup-closed-by-user': 'Sign-in was cancelled. Try again when you’re ready.',
  'auth/cancelled-popup-request': 'Sign-in was cancelled. Try again when you’re ready.',
  'auth/popup-blocked': 'Your browser blocked the sign-in popup. Allow popups for this site, then try again.',
  'auth/network-request-failed': 'Network error. Check your connection and try again.',
};

function toErrorCopy(error: unknown): string {
  const code =
    typeof error === 'object' && error !== null && 'code' in error ? String((error as { code: unknown }).code) : '';
  return (
    FIREBASE_ERROR_COPY[code] ??
    'We couldn’t sign you in. Try again, or contact the platform team if it keeps happening.'
  );
}

function GoogleSignIn() {
  const callSigninFn = useServerFn(signinFn);
  const firebaseClient = useFirebase();
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const signIn = async () => {
    setError(null);
    setPending(true);

    let idToken: string;
    try {
      idToken = await firebaseClient.signInWithGoogle();
    } catch (popupError) {
      // Client-side auth (popup cancelled / blocked / network) — surface and let them retry.
      setError(toErrorCopy(popupError));
      setPending(false);
      return;
    }

    // On success `signinFn` throws a redirect to /dashboard; on failure it redirects
    // back here. Either way we let the router follow it — no manual navigation.
    await callSigninFn({ data: { idToken } });
    setPending(false);
  };

  return (
    <div className="flex flex-col gap-sm">
      <GoogleButton onClick={signIn} loading={pending} />
      {error ? (
        <p role="alert" className="text-red-primary flex items-start gap-xs text-s">
          <Icon icon="warning" className="mt-px size-4 shrink-0" />
          <span>{error}</span>
        </p>
      ) : null}
    </div>
  );
}

function GoogleButton({ onClick, loading, disabled }: { onClick?: () => void; loading?: boolean; disabled?: boolean }) {
  return (
    <Button
      variant="secondary"
      color="grey"
      size="large"
      appearance="stroked"
      className="relative w-full justify-center gap-sm"
      onClick={onClick}
      disabled={loading || disabled}
    >
      <Logo logo="google-logo" className="size-5 shrink-0" />
      <span className="text-s font-medium">{loading ? 'Signing in…' : 'Sign in with Google'}</span>
      {loading ? <Icon icon="spinner" className="absolute insert-e-sm size-4 animate-spin" /> : null}
    </Button>
  );
}
