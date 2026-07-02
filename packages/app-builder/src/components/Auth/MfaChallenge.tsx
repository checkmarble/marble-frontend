import { type AuthPayload } from '@app-builder/services/auth/auth.server';
import { InvalidVerificationCode, useResolveMfaTotpSignIn } from '@app-builder/services/auth/auth-client';
import { useClientServices } from '@app-builder/services/init-client';
import { type MultiFactorResolver } from 'firebase/auth';
import { useState } from 'react';
import toast from 'react-hot-toast';
import { useTranslation } from 'react-i18next';
import { Button, Input } from 'ui-design-system';
import { Spinner } from '../Spinner';
import { MfaPhoneChallenge } from './MfaPhoneChallenge';

type MfaChallengeProps = {
  resolver: MultiFactorResolver;
  signIn: (authPayload: AuthPayload) => void;
  authType?: AuthPayload['type'];
  loading?: boolean;
  onCancel: () => void;
};

// Picks the challenge flow based on the enrolled second factor. TOTP needs no SMS
// round-trip (the user reads the code from their authenticator), so it's a distinct flow.
export function MfaChallenge(props: MfaChallengeProps) {
  const totpHint = props.resolver.hints.find((hint) => hint.factorId === 'totp');

  if (totpHint) {
    return <MfaTotpChallenge {...props} enrollmentId={totpHint.uid} />;
  }

  return <MfaPhoneChallenge {...props} />;
}

function MfaTotpChallenge({
  resolver,
  signIn,
  authType = 'email',
  loading,
  onCancel,
  enrollmentId,
}: MfaChallengeProps & { enrollmentId: string }) {
  const { t } = useTranslation(['auth', 'common']);
  const { authenticationClientService } = useClientServices();
  const resolveMfaTotpSignIn = useResolveMfaTotpSignIn(authenticationClientService);

  const [code, setCode] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  const busy = pending || loading;

  const handleVerify = async () => {
    setError(null);
    setPending(true);
    try {
      const result = await resolveMfaTotpSignIn(resolver, enrollmentId, code);
      if (result) {
        signIn({ type: authType, idToken: result.idToken, refreshToken: result.refreshToken, csrf: result.csrf });
      }
    } catch (verifyError) {
      if (verifyError instanceof InvalidVerificationCode) {
        setError(t('auth:mfa.error.invalid_code'));
      } else {
        toast.error(t('common:errors.unknown'));
      }
    } finally {
      setPending(false);
    }
  };

  return (
    <form
      className="flex w-full flex-col gap-lg"
      onSubmit={(e) => {
        e.preventDefault();
        handleVerify();
      }}
    >
      <div className="flex flex-col gap-xs">
        <span className="text-l font-semibold">{t('auth:mfa.challenge.title')}</span>
        <span className="text-s text-grey-secondary">{t('auth:mfa.challenge.totp_description')}</span>
      </div>

      <div className="flex flex-col items-start gap-sm">
        <label htmlFor="mfa-totp-code" className="text-s">
          {t('auth:mfa.challenge.code_label')}
        </label>
        <Input
          id="mfa-totp-code"
          inputMode="numeric"
          autoComplete="one-time-code"
          maxLength={6}
          className="w-full"
          value={code}
          onChange={(e) => setCode(e.currentTarget.value.replace(/\D/g, ''))}
          borderColor={error ? 'redfigma-47' : 'greyfigma-90'}
        />
        {error ? <span className="text-xs text-red-primary">{error}</span> : null}
      </div>

      <div className="flex flex-col gap-sm">
        <Button type="submit" size="large" className="w-full justify-center" disabled={busy || code.length < 6}>
          {busy ? <Spinner className="size-4" /> : t('auth:mfa.challenge.verify')}
        </Button>
        <Button
          type="button"
          variant="secondary"
          size="large"
          className="w-full justify-center"
          disabled={busy}
          onClick={onCancel}
        >
          {t('common:cancel')}
        </Button>
      </div>
    </form>
  );
}
