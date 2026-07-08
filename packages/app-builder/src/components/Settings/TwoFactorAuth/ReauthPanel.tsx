import {
  InvalidLoginCredentials,
  useGetCurrentUserProviderIds,
  useReauthenticateWithOAuth,
  useReauthenticateWithPassword,
} from '@app-builder/services/auth/auth-client';
import { useClientServices } from '@app-builder/services/init-client';
import { useMutation, useQuery } from '@tanstack/react-query';
import { useState } from 'react';
import toast from 'react-hot-toast';
import { useTranslation } from 'react-i18next';
import { Button, Input } from 'ui-design-system';
import { Icon, Logo } from 'ui-icons';

// Re-authenticates the current user in place (Firebase requires a recent login before
// changing MFA settings). Shows password and/or OAuth options based on the user's providers.
export function ReauthPanel({ onReauthenticated }: { onReauthenticated: () => void }) {
  const { t } = useTranslation(['account', 'common']);
  const { authenticationClientService } = useClientServices();

  const getCurrentUserProviderIds = useGetCurrentUserProviderIds(authenticationClientService);
  const reauthenticateWithPassword = useReauthenticateWithPassword(authenticationClientService);
  const reauthenticateWithOAuth = useReauthenticateWithOAuth(authenticationClientService);

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

  const passwordMutation = useMutation({
    mutationFn: () => reauthenticateWithPassword(password),
    onSuccess: () => onReauthenticated(),
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
    onSuccess: (completed) => {
      if (completed) onReauthenticated();
    },
    onError: () => toast.error(t('account:mfa.error.unknown')),
  });

  if (providersQuery.isPending) {
    return (
      <div className="flex justify-center">
        <Icon icon="spinner" className="size-6 animate-spin" />
      </div>
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
