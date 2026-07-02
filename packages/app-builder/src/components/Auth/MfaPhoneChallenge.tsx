import { type AuthPayload } from '@app-builder/services/auth/auth.server';
import {
  InvalidVerificationCode,
  useResolveMfaPhoneSignIn,
  useSendMfaPhoneChallenge,
} from '@app-builder/services/auth/auth-client';
import { useClientServices } from '@app-builder/services/init-client';
import { type MultiFactorResolver, type PhoneMultiFactorInfo } from 'firebase/auth';
import { useRef, useState } from 'react';
import toast from 'react-hot-toast';
import { useTranslation } from 'react-i18next';
import { Button, Input } from 'ui-design-system';
import { Spinner } from '../Spinner';

export function MfaPhoneChallenge({
  resolver,
  signIn,
  authType = 'email',
  loading,
  onCancel,
}: {
  resolver: MultiFactorResolver;
  signIn: (authPayload: AuthPayload) => void;
  authType?: AuthPayload['type'];
  loading?: boolean;
  onCancel: () => void;
}) {
  const { t } = useTranslation(['auth', 'common']);
  const { authenticationClientService } = useClientServices();
  const sendMfaPhoneChallenge = useSendMfaPhoneChallenge(authenticationClientService);
  const resolveMfaPhoneSignIn = useResolveMfaPhoneSignIn(authenticationClientService);

  const recaptchaRef = useRef<HTMLDivElement>(null);
  const [step, setStep] = useState<'send' | 'code'>('send');
  const [verificationId, setVerificationId] = useState<string | null>(null);
  const [code, setCode] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  const hint = resolver.hints[0] as PhoneMultiFactorInfo | undefined;
  const maskedPhone = hint?.phoneNumber ?? '';

  const handleSend = async () => {
    if (!recaptchaRef.current) return;
    setError(null);
    setPending(true);
    try {
      const id = await sendMfaPhoneChallenge(resolver, recaptchaRef.current);
      if (id) {
        setVerificationId(id);
        setStep('code');
      }
    } catch (_error) {
      toast.error(t('common:errors.unknown'));
    } finally {
      setPending(false);
    }
  };

  const handleVerify = async () => {
    if (!verificationId) return;
    setError(null);
    setPending(true);
    try {
      const result = await resolveMfaPhoneSignIn(resolver, verificationId, code);
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

  const busy = pending || loading;

  return (
    <div className="flex w-full flex-col gap-lg">
      <div className="flex flex-col gap-xs">
        <span className="text-l font-semibold">{t('auth:mfa.challenge.title')}</span>
        <span className="text-s text-grey-secondary">
          {step === 'send'
            ? t('auth:mfa.challenge.send_description', { phone: maskedPhone })
            : t('auth:mfa.challenge.code_description', { phone: maskedPhone })}
        </span>
      </div>

      {step === 'code' ? (
        <div className="flex flex-col items-start gap-sm">
          <label htmlFor="mfa-challenge-code" className="text-s">
            {t('auth:mfa.challenge.code_label')}
          </label>
          <Input
            id="mfa-challenge-code"
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
      ) : null}

      {/* Invisible reCAPTCHA container required by Firebase phone auth (auto-solved by the emulator). */}
      <div ref={recaptchaRef} />

      <div className="flex flex-col gap-sm">
        {step === 'send' ? (
          <Button size="large" className="w-full justify-center" disabled={busy} onClick={handleSend}>
            {busy ? <Spinner className="size-4" /> : t('auth:mfa.challenge.send_code')}
          </Button>
        ) : (
          <Button
            size="large"
            className="w-full justify-center"
            disabled={busy || code.length < 6}
            onClick={handleVerify}
          >
            {busy ? <Spinner className="size-4" /> : t('auth:mfa.challenge.verify')}
          </Button>
        )}
        <Button variant="secondary" size="large" className="w-full justify-center" disabled={busy} onClick={onCancel}>
          {t('common:cancel')}
        </Button>
      </div>
    </div>
  );
}
