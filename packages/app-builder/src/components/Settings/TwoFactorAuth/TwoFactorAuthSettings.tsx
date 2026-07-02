import { type TotpEnrollmentParams } from '@app-builder/repositories/AuthenticationRepository';
import {
  InvalidPhoneNumber,
  InvalidVerificationCode,
  RequiresRecentLogin,
  useFinalizePhoneEnrollment,
  useFinalizeTotpEnrollment,
  useGetEnrolledMfaFactors,
  useStartPhoneEnrollment,
  useStartTotpEnrollment,
  useUnenrollMfaFactor,
} from '@app-builder/services/auth/auth-client';
import { useClientServices } from '@app-builder/services/init-client';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { QRCodeSVG } from 'qrcode.react';
import { useRef, useState } from 'react';
import toast from 'react-hot-toast';
import { useTranslation } from 'react-i18next';
import { Button, Input, Modal } from 'ui-design-system';
import { Icon } from 'ui-icons';
import { ReauthPanel } from './ReauthPanel';

const enrolledFactorsQueryKey = ['mfa', 'enrolled-factors'];

export function TwoFactorAuthSettings() {
  const { t, i18n } = useTranslation(['account', 'common']);
  const { authenticationClientService } = useClientServices();
  const queryClient = useQueryClient();

  const getEnrolledMfaFactors = useGetEnrolledMfaFactors(authenticationClientService);
  const unenrollMfaFactor = useUnenrollMfaFactor(authenticationClientService);

  const factorsQuery = useQuery({
    queryKey: enrolledFactorsQueryKey,
    queryFn: getEnrolledMfaFactors,
  });

  const unenrollMutation = useMutation({
    mutationFn: (factorUid: string) => unenrollMfaFactor(factorUid),
    onSuccess: async () => {
      toast.success(t('account:mfa.remove.success'));
      await queryClient.invalidateQueries({ queryKey: enrolledFactorsQueryKey });
    },
    onError: () => toast.error(t('account:mfa.error.unknown')),
  });

  const factors = factorsQuery.data ?? [];

  return (
    <div className="bg-surface-card border-grey-border flex w-full flex-col gap-md rounded-lg border p-md">
      <div className="flex flex-col gap-xs">
        <span className="text-s font-semibold">{t('account:mfa.title')}</span>
        <span className="text-xs text-grey-secondary">{t('account:mfa.description')}</span>
      </div>

      {factorsQuery.isLoading ? (
        <Icon icon="spinner" className="size-5 animate-spin" />
      ) : factors.length > 0 ? (
        <ul className="flex flex-col gap-sm">
          {factors.map((factor) => (
            <li
              key={factor.uid}
              className="border-grey-border flex items-center justify-between rounded-sm border p-sm"
            >
              <span className="flex items-center gap-sm text-s">
                <Icon icon="lock" className="size-5 text-green-primary" />
                <span className="flex flex-col">
                  <span>{factor.displayName ?? t('account:mfa.default_factor_name')}</span>
                  <span className="text-xs text-grey-secondary">
                    {t('account:mfa.enrolled_on', {
                      date: new Date(factor.enrollmentTime).toLocaleDateString(i18n.language),
                    })}
                  </span>
                </span>
              </span>
              <Button
                variant="secondary"
                color="red"
                disabled={unenrollMutation.isPending}
                onClick={() => unenrollMutation.mutate(factor.uid)}
              >
                {t('account:mfa.remove')}
              </Button>
            </li>
          ))}
        </ul>
      ) : (
        <span className="text-xs text-grey-secondary">{t('account:mfa.status.disabled')}</span>
      )}

      <div className="flex flex-wrap gap-sm">
        <EnrollTotpModal onEnrolled={() => queryClient.invalidateQueries({ queryKey: enrolledFactorsQueryKey })} />
        <EnrollPhoneModal onEnrolled={() => queryClient.invalidateQueries({ queryKey: enrolledFactorsQueryKey })} />
      </div>
    </div>
  );
}

function EnrollTotpModal({ onEnrolled }: { onEnrolled: () => void }) {
  const { t } = useTranslation(['account', 'common']);
  const { authenticationClientService } = useClientServices();

  const startTotpEnrollment = useStartTotpEnrollment(authenticationClientService);
  const finalizeTotpEnrollment = useFinalizeTotpEnrollment(authenticationClientService);

  const [open, setOpen] = useState(false);
  const [needsReauth, setNeedsReauth] = useState(false);
  const [enrollment, setEnrollment] = useState<TotpEnrollmentParams | null>(null);
  const [code, setCode] = useState('');
  const [error, setError] = useState<string | null>(null);

  const startMutation = useMutation({
    mutationFn: () => startTotpEnrollment(),
    onSuccess: (params) => {
      setNeedsReauth(false);
      setEnrollment(params ?? null);
    },
    onError: (err) => {
      if (err instanceof RequiresRecentLogin) {
        // Prompt the user to re-authenticate in place, then retry enrollment.
        setNeedsReauth(true);
      } else {
        toast.error(t('account:mfa.error.unknown'));
        setOpen(false);
      }
    },
  });

  const finalizeMutation = useMutation({
    mutationFn: () => {
      if (!enrollment) throw new Error('No pending enrollment');
      return finalizeTotpEnrollment(enrollment.secret, code, t('account:mfa.default_factor_name_totp'));
    },
    onSuccess: () => {
      toast.success(t('account:mfa.enroll.success'));
      onEnrolled();
      setOpen(false);
    },
    onError: (err) => {
      if (err instanceof InvalidVerificationCode) {
        setError(t('account:mfa.error.invalid_code'));
      } else {
        toast.error(t('account:mfa.error.unknown'));
      }
    },
  });

  const handleOpenChange = (next: boolean) => {
    setOpen(next);
    if (next) {
      setNeedsReauth(false);
      setEnrollment(null);
      setCode('');
      setError(null);
      startMutation.mutate();
    }
  };

  return (
    <Modal.Root open={open} onOpenChange={handleOpenChange}>
      <Modal.Trigger asChild>
        <Button variant="primary" className="self-start">
          <Icon icon="plus" className="size-5" />
          {t('account:mfa.add_authenticator')}
        </Button>
      </Modal.Trigger>
      <Modal.Content>
        {needsReauth ? (
          <>
            <Modal.Title>{t('account:mfa.reauth.title')}</Modal.Title>
            <div className="flex flex-col gap-lg p-lg">
              <ReauthPanel onReauthenticated={() => startMutation.mutate()} />
            </div>
            <Modal.Footer>
              <Modal.FooterButton isCloseButton label={t('common:cancel')} />
            </Modal.Footer>
          </>
        ) : (
          <form
            onSubmit={(e) => {
              e.preventDefault();
              setError(null);
              finalizeMutation.mutate();
            }}
          >
            <Modal.Title>{t('account:mfa.enroll.totp_title')}</Modal.Title>
            <div className="flex flex-col gap-lg p-lg">
              {startMutation.isPending || !enrollment ? (
                <div className="flex justify-center">
                  <Icon icon="spinner" className="size-6 animate-spin" />
                </div>
              ) : (
                <>
                  <p className="text-s text-grey-secondary">{t('account:mfa.enroll.totp_instructions')}</p>
                  <div className="flex justify-center rounded-sm bg-white p-md">
                    <QRCodeSVG value={enrollment.qrCodeUrl} size={160} />
                  </div>
                  <div className="flex flex-col gap-xs">
                    <span className="text-xs font-medium">{t('account:mfa.enroll.secret_key')}</span>
                    <code className="bg-grey-background text-grey-primary select-all break-all rounded-sm p-sm text-xs">
                      {enrollment.secretKey}
                    </code>
                  </div>
                  <div className="flex flex-col gap-xs">
                    <label htmlFor="totp-enroll-code" className="text-xs font-medium">
                      {t('account:mfa.enroll.code_label')}
                    </label>
                    <Input
                      id="totp-enroll-code"
                      inputMode="numeric"
                      autoComplete="one-time-code"
                      maxLength={6}
                      value={code}
                      onChange={(e) => setCode(e.currentTarget.value.replace(/\D/g, ''))}
                      borderColor={error ? 'redfigma-47' : 'greyfigma-90'}
                    />
                    {error ? <span className="text-xs text-red-primary">{error}</span> : null}
                  </div>
                </>
              )}
            </div>
            <Modal.Footer>
              <Modal.FooterButton isCloseButton label={t('common:cancel')} />
              <Modal.FooterButton
                type="submit"
                label={t('account:mfa.enroll.confirm')}
                disabled={!enrollment || code.length < 6}
                isLoading={finalizeMutation.isPending}
              />
            </Modal.Footer>
          </form>
        )}
      </Modal.Content>
    </Modal.Root>
  );
}

function EnrollPhoneModal({ onEnrolled }: { onEnrolled: () => void }) {
  const { t } = useTranslation(['account', 'common']);
  const { authenticationClientService } = useClientServices();

  const startPhoneEnrollment = useStartPhoneEnrollment(authenticationClientService);
  const finalizePhoneEnrollment = useFinalizePhoneEnrollment(authenticationClientService);

  const recaptchaRef = useRef<HTMLDivElement>(null);

  const [open, setOpen] = useState(false);
  const [step, setStep] = useState<'phone' | 'code'>('phone');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [verificationId, setVerificationId] = useState<string | null>(null);
  const [code, setCode] = useState('');
  const [error, setError] = useState<string | null>(null);

  const startMutation = useMutation({
    mutationFn: () => {
      if (!recaptchaRef.current) throw new Error('reCAPTCHA container not ready');
      return startPhoneEnrollment(phoneNumber, recaptchaRef.current);
    },
    onSuccess: (id) => {
      setVerificationId(id ?? null);
      setStep('code');
    },
    onError: (err) => {
      if (err instanceof InvalidPhoneNumber) {
        setError(t('account:mfa.error.invalid_phone'));
      } else if (err instanceof RequiresRecentLogin) {
        toast.error(t('account:mfa.error.requires_recent_login'));
        setOpen(false);
      } else {
        toast.error(t('account:mfa.error.unknown'));
      }
    },
  });

  const finalizeMutation = useMutation({
    mutationFn: () => {
      if (!verificationId) throw new Error('No pending enrollment');
      return finalizePhoneEnrollment(verificationId, code, t('account:mfa.default_factor_name'));
    },
    onSuccess: () => {
      toast.success(t('account:mfa.enroll.success'));
      onEnrolled();
      setOpen(false);
    },
    onError: (err) => {
      if (err instanceof InvalidVerificationCode) {
        setError(t('account:mfa.error.invalid_code'));
      } else {
        toast.error(t('account:mfa.error.unknown'));
      }
    },
  });

  const handleOpenChange = (next: boolean) => {
    setOpen(next);
    if (next) {
      setStep('phone');
      setPhoneNumber('');
      setVerificationId(null);
      setCode('');
      setError(null);
    }
  };

  return (
    <Modal.Root open={open} onOpenChange={handleOpenChange}>
      <Modal.Trigger asChild>
        <Button variant="primary" className="self-start">
          <Icon icon="plus" className="size-5" />
          {t('account:mfa.add_phone')}
        </Button>
      </Modal.Trigger>
      <Modal.Content>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            setError(null);
            if (step === 'phone') {
              startMutation.mutate();
            } else {
              finalizeMutation.mutate();
            }
          }}
        >
          <Modal.Title>{t('account:mfa.enroll.title')}</Modal.Title>
          <div className="flex flex-col gap-lg p-lg">
            {step === 'phone' ? (
              <div className="flex flex-col gap-xs">
                <label htmlFor="mfa-phone" className="text-xs font-medium">
                  {t('account:mfa.enroll.phone_label')}
                </label>
                <Input
                  id="mfa-phone"
                  type="tel"
                  autoComplete="tel"
                  placeholder={t('account:mfa.enroll.phone_placeholder')}
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.currentTarget.value)}
                  borderColor={error ? 'redfigma-47' : 'greyfigma-90'}
                />
                <span className="text-xs text-grey-secondary">{t('account:mfa.enroll.phone_instructions')}</span>
                {error ? <span className="text-xs text-red-primary">{error}</span> : null}
              </div>
            ) : (
              <div className="flex flex-col gap-xs">
                <label htmlFor="mfa-code" className="text-xs font-medium">
                  {t('account:mfa.enroll.code_label')}
                </label>
                <Input
                  id="mfa-code"
                  inputMode="numeric"
                  autoComplete="one-time-code"
                  maxLength={6}
                  value={code}
                  onChange={(e) => setCode(e.currentTarget.value.replace(/\D/g, ''))}
                  borderColor={error ? 'redfigma-47' : 'greyfigma-90'}
                />
                <span className="text-xs text-grey-secondary">{t('account:mfa.enroll.code_instructions')}</span>
                {error ? <span className="text-xs text-red-primary">{error}</span> : null}
              </div>
            )}
          </div>
          {/* Invisible reCAPTCHA container required by Firebase phone auth (auto-solved by the emulator). */}
          <div ref={recaptchaRef} />
          <Modal.Footer>
            <Modal.FooterButton isCloseButton label={t('common:cancel')} />
            {step === 'phone' ? (
              <Modal.FooterButton
                type="submit"
                label={t('account:mfa.enroll.send_code')}
                disabled={phoneNumber.length === 0}
                isLoading={startMutation.isPending}
              />
            ) : (
              <Modal.FooterButton
                type="submit"
                label={t('account:mfa.enroll.confirm')}
                disabled={code.length < 6}
                isLoading={finalizeMutation.isPending}
              />
            )}
          </Modal.Footer>
        </form>
      </Modal.Content>
    </Modal.Root>
  );
}
