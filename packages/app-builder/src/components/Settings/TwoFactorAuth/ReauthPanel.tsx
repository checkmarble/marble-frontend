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
import { Icon } from 'ui-icons';

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
  const providerIds = providersQuery.data ?? [];
  const hasPassword = providerIds.includes('password');
  const hasGoogle = providerIds.includes('google.com');
  const hasMicrosoft = providerIds.includes('microsoft.com');

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
            value={password}
            onChange={(e) => setPassword(e.currentTarget.value)}
            borderColor={error ? 'redfigma-47' : 'greyfigma-90'}
          />
          {error ? <span className="text-xs text-red-primary">{error}</span> : null}
          <Button type="submit" className="self-start" disabled={passwordMutation.isPending || password.length === 0}>
            {t('account:mfa.reauth.confirm')}
          </Button>
        </form>
      ) : null}

      {hasGoogle ? (
        <Button
          variant="secondary"
          appearance="stroked"
          disabled={oauthMutation.isPending}
          onClick={() => oauthMutation.mutate('google.com')}
        >
          {t('account:mfa.reauth.with_google')}
        </Button>
      ) : null}

      {hasMicrosoft ? (
        <Button
          variant="secondary"
          appearance="stroked"
          disabled={oauthMutation.isPending}
          onClick={() => oauthMutation.mutate('microsoft.com')}
        >
          {t('account:mfa.reauth.with_microsoft')}
        </Button>
      ) : null}
    </div>
  );
}
