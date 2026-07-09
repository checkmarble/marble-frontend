import { type TotpEnrollmentParams } from '@app-builder/repositories/AuthenticationRepository';
import {
  InvalidVerificationCode,
  RequiresRecentLogin,
  useFinalizeTotpEnrollment,
  useGetEnrolledMfaFactors,
  useStartTotpEnrollment,
  useUnenrollMfaFactor,
} from '@app-builder/services/auth/auth-client';
import { useClientServices } from '@app-builder/services/init-client';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { QRCodeSVG } from 'qrcode.react';
import { useState } from 'react';
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

  // Factor pending removal, held while the user re-authenticates. Firebase requires a
  // recent login to unenroll, same as for enrollment.
  const [reauthForRemoval, setReauthForRemoval] = useState<string | null>(null);

  const unenrollMutation = useMutation({
    mutationFn: (factorUid: string) => unenrollMfaFactor(factorUid),
    onSuccess: async () => {
      toast.success(t('account:mfa.remove.success'));
      setReauthForRemoval(null);
      await queryClient.invalidateQueries({ queryKey: enrolledFactorsQueryKey });
    },
    onError: (err, factorUid) => {
      if (err instanceof RequiresRecentLogin) {
        // Prompt the user to re-authenticate in place, then retry the removal.
        setReauthForRemoval(factorUid);
      } else {
        toast.error(t('account:mfa.error.unknown'));
      }
    },
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
                  <span>{factor.displayName ?? t('account:mfa.default_factor_name_totp')}</span>
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

      <div className="flex flex-col gap-sm">
        <EnrollTotpModal onEnrolled={() => queryClient.invalidateQueries({ queryKey: enrolledFactorsQueryKey })} />
      </div>

      <Modal.Root
        open={reauthForRemoval !== null}
        onOpenChange={(open) => {
          if (!open) setReauthForRemoval(null);
        }}
      >
        <Modal.Content>
          <Modal.Title>{t('account:mfa.reauth.title')}</Modal.Title>
          <div className="flex flex-col gap-lg p-lg">
            <ReauthPanel
              onReauthenticated={() => {
                if (reauthForRemoval) unenrollMutation.mutate(reauthForRemoval);
              }}
            />
          </div>
          <Modal.Footer>
            <Modal.FooterButton isCloseButton label={t('common:cancel')} />
          </Modal.Footer>
        </Modal.Content>
      </Modal.Root>
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
              // Guard against keyboard resubmit: the footer button stays clickable (only
              // pointer-events are disabled) while finalizing.
              if (finalizeMutation.isPending) return;
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
