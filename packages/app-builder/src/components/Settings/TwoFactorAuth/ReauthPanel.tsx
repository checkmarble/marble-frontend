import {
  InvalidLoginCredentials,
  InvalidVerificationCode,
  useGetCurrentUserProviderIds,
  useReauthenticateWithOAuth,
  useReauthenticateWithPassword,
  useResolveMfaTotpSignIn,
} from '@app-builder/services/auth/auth-client';
import { useClientServices } from '@app-builder/services/init-client';
import { useMutation, useQuery } from '@tanstack/react-query';
import { type MultiFactorResolver } from 'firebase/auth';
import { useState } from 'react';
import toast from 'react-hot-toast';
import { useTranslation } from 'react-i18next';
import { Button, Input } from 'ui-design-system';
import { Icon, Logo } from 'ui-icons';

// Re-authenticates the current user in place (Firebase requires a recent login before
// changing MFA settings). Shows password and/or OAuth options based on the user's providers.
// When the account has MFA enrolled, reauthentication itself triggers a second-factor (TOTP)
// challenge, which is resolved here before the caller's operation is retried.
export function ReauthPanel({ onReauthenticated }: { onReauthenticated: () => void }) {
  const { t } = useTranslation(['account', 'common', 'auth']);
  const { authenticationClientService } = useClientServices();

  const getCurrentUserProviderIds = useGetCurrentUserProviderIds(authenticationClientService);
  const reauthenticateWithPassword = useReauthenticateWithPassword(authenticationClientService);
  const reauthenticateWithOAuth = useReauthenticateWithOAuth(authenticationClientService);
  const resolveMfaTotpSignIn = useResolveMfaTotpSignIn(authenticationClientService);

  const providersQuery = useQuery({
    queryKey: ['mfa', 'reauth', 'provider-ids'],
    queryFn: getCurrentUserProviderIds,
  });
  // Exact membership over Firebase's fixed provider-id constants (not URLs). A Set keeps
  // this unambiguous and sidesteps CodeQL's URL-substring heuristic on `.includes('…com')`.
  const providerIds = new Set(providersQuery.data ?? []);
  const hasPassword = providerIds.has('password');
  const hasGoogle = providerIds.has('google.com');
  const hasMicrosoft = providerIds.has('microsoft.com');

  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);

  // Set when the first factor succeeded but Firebase requires a second-factor challenge.
  const [mfaResolver, setMfaResolver] = useState<MultiFactorResolver | null>(null);
  const [mfaCode, setMfaCode] = useState('');

  const passwordMutation = useMutation({
    mutationFn: () => reauthenticateWithPassword(password),
    onSuccess: (result) => {
      if (result.mfaRequired) {
        setError(null);
        setMfaResolver(result.resolver);
      } else {
        onReauthenticated();
      }
    },
    onError: (err) => {
      if (err instanceof InvalidLoginCredentials) {
        setError(t('account:mfa.reauth.wrong_password'));
      } else {
        toast.error(t('account:mfa.error.unknown'));
      }
    },
  });

  const oauthMutation = useMutation({
    mutationFn: (providerId: 'google.com' | 'microsoft.com') => reauthenticateWithOAuth(providerId),
    onSuccess: (result) => {
      if ('cancelled' in result) return;
      if (result.mfaRequired) {
        setError(null);
        setMfaResolver(result.resolver);
      } else {
        onReauthenticated();
      }
    },
    onError: () => toast.error(t('account:mfa.error.unknown')),
  });

  const mfaMutation = useMutation({
    mutationFn: () => {
      if (!mfaResolver) throw new Error('No MFA resolver');
      const totpHint = mfaResolver.hints.find((hint) => hint.factorId === 'totp');
      if (!totpHint) throw new Error('No TOTP factor to challenge');
      return resolveMfaTotpSignIn(mfaResolver, totpHint.uid, mfaCode);
    },
    onSuccess: () => onReauthenticated(),
    onError: (err) => {
      if (err instanceof InvalidVerificationCode) {
        setError(t('account:mfa.error.invalid_code'));
      } else {
        toast.error(t('account:mfa.error.unknown'));
      }
    },
  });

  if (providersQuery.isPending) {
    return (
      <div className="flex justify-center">
        <Icon icon="spinner" className="size-6 animate-spin" />
      </div>
    );
  }

  // Second-factor step: reauthentication of an MFA-enrolled account requires the TOTP code.
  if (mfaResolver) {
    return (
      <form
        className="flex flex-col gap-lg"
        onSubmit={(e) => {
          e.preventDefault();
          setError(null);
          mfaMutation.mutate();
        }}
      >
        <p className="text-s text-grey-secondary">{t('auth:mfa.challenge.totp_description')}</p>
        <div className="flex flex-col gap-xs">
          <label htmlFor="reauth-mfa-code" className="text-xs font-medium">
            {t('auth:mfa.challenge.code_label')}
          </label>
          <Input
            id="reauth-mfa-code"
            inputMode="numeric"
            autoComplete="one-time-code"
            maxLength={6}
            value={mfaCode}
            onChange={(e) => setMfaCode(e.currentTarget.value.replace(/\D/g, ''))}
            borderColor={error ? 'redfigma-47' : 'greyfigma-90'}
          />
          {error ? <span className="text-xs text-red-primary">{error}</span> : null}
        </div>
        <Button
          type="submit"
          size="large"
          className="w-full justify-center"
          disabled={mfaMutation.isPending || mfaCode.length < 6}
        >
          {t('auth:mfa.challenge.verify')}
        </Button>
      </form>
    );
  }

  const hasOAuth = hasGoogle || hasMicrosoft;

  return (
    <div className="flex flex-col gap-lg">
      <p className="text-s text-grey-secondary">{t('account:mfa.reauth.description')}</p>

      {hasPassword ? (
        <form
          className="flex flex-col gap-sm"
          onSubmit={(e) => {
            e.preventDefault();
            setError(null);
            passwordMutation.mutate();
          }}
        >
          <label htmlFor="reauth-password" className="text-xs font-medium">
            {t('account:mfa.reauth.password_label')}
          </label>
          <Input
            id="reauth-password"
            type="password"
            autoComplete="current-password"
            startAdornment="lock"
            value={password}
            onChange={(e) => setPassword(e.currentTarget.value)}
            borderColor={error ? 'redfigma-47' : 'greyfigma-90'}
          />
          {error ? <span className="text-xs text-red-primary">{error}</span> : null}
          <Button
            type="submit"
            size="large"
            className="w-full justify-center"
            disabled={passwordMutation.isPending || password.length === 0}
          >
            {t('account:mfa.reauth.confirm')}
          </Button>
        </form>
      ) : null}

      {hasPassword && hasOAuth ? (
        <div className="flex items-center gap-md">
          <div className="h-px bg-grey-border grow" />
          <span className="text-xs text-grey-secondary">{t('common:or')}</span>
          <div className="h-px bg-grey-border grow" />
        </div>
      ) : null}

      {hasGoogle ? (
        <Button
          variant="secondary"
          color="grey"
          size="large"
          appearance="stroked"
          className="w-full justify-center gap-sm"
          disabled={oauthMutation.isPending}
          onClick={() => oauthMutation.mutate('google.com')}
        >
          <Logo logo="google-logo" className="size-6" />
          <span className="text-s whitespace-nowrap text-center font-medium">
            {t('account:mfa.reauth.with_google')}
          </span>
        </Button>
      ) : null}

      {hasMicrosoft ? (
        <Button
          variant="secondary"
          color="grey"
          size="large"
          appearance="stroked"
          className="w-full justify-center gap-sm"
          disabled={oauthMutation.isPending}
          onClick={() => oauthMutation.mutate('microsoft.com')}
        >
          <Logo logo="microsoft-logo" className="size-6" />
          <span className="text-s whitespace-nowrap text-center font-medium">
            {t('account:mfa.reauth.with_microsoft')}
          </span>
        </Button>
      ) : null}
    </div>
  );
}
