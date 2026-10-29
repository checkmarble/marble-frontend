import { type DiscoverSignInResult, discoverSignInFn } from '@app-builder/server-fns/auth';
import { getFieldErrors, handleSubmit } from '@app-builder/utils/form';
import { useForm } from '@tanstack/react-form';
import { useMutation } from '@tanstack/react-query';
import { useHydrated } from '@tanstack/react-router';
import { useState } from 'react';
import { Trans, useTranslation } from 'react-i18next';
import { Button, Input, Typo } from 'ui-design-system';
import { Icon } from 'ui-icons';
import * as z from 'zod/v4';
import { FormErrorOrDescription } from '../Form/Tanstack/FormErrorOrDescription';
import { Spinner } from '../Spinner';
import { authI18n } from './auth-i18n';

const emailDiscoveryFormSchema = z.object({
  email: z.email(),
});

type DiscoveryError = Extract<DiscoverSignInResult, { type: 'error' }>['error'];

const discoveryErrorLabels = {
  unknown_domain: 'auth:sign_in.discovery.errors.unknown_domain',
  discovery_failed: 'auth:sign_in.discovery.errors.discovery_failed',
} as const satisfies Record<DiscoveryError, string>;

export function SignInWithEmailDiscovery({
  prefilledEmail,
  redirectTo,
  signedOut,
}: {
  prefilledEmail: string;
  redirectTo: string | null;
  signedOut: boolean;
}) {
  const { t } = useTranslation(authI18n);
  const hydrated = useHydrated();
  const [discoveryError, setDiscoveryError] = useState<DiscoveryError | null>(null);
  const [redirecting, setRedirecting] = useState(false);

  const discoverMutation = useMutation({
    mutationFn: (email: string) =>
      discoverSignInFn({ data: { email, redirectTo: redirectTo ?? undefined, signedOut } }),
    onSuccess: (result) => {
      if (result.type === 'error') {
        setDiscoveryError(result.error);
        return;
      }
      setRedirecting(true);
      window.location.assign(result.href);
    },
    onError: () => setDiscoveryError('discovery_failed'),
  });

  const form = useForm({
    defaultValues: { email: prefilledEmail },
    validators: { onSubmit: emailDiscoveryFormSchema },
    onSubmit: ({ value }) => {
      setDiscoveryError(null);
      discoverMutation.mutate(value.email.trim());
    },
  });

  const pending = discoverMutation.isPending || redirecting;
  const highlight = { Highlight: <span className="text-purple-primary" /> };

  return (
    <div className="flex w-full flex-col gap-xl">
      <Typo variant="title1" className="text-center">
        <Trans t={t} i18nKey="auth:sign_in.discovery.title" components={highlight} />
      </Typo>
      <form className="flex w-full flex-col gap-sm" onSubmit={handleSubmit(form)} noValidate>
        <form.Field
          name="email"
          validators={{ onChange: emailDiscoveryFormSchema.shape.email }}
          listeners={{ onChange: () => setDiscoveryError(null) }}
        >
          {(field) => {
            const hasError = field.state.meta.errors.length > 0 || discoveryError !== null;
            return (
              <>
                <label htmlFor={field.name} className="text-grey-primary">
                  <Trans t={t} i18nKey="auth:sign_in.discovery.subtitle" components={highlight} />
                </label>
                <div className="flex w-full items-center gap-sm">
                  <Input
                    id={field.name}
                    name={field.name}
                    type="email"
                    autoComplete="email"
                    placeholder="joe@alasta.io"
                    className="grow"
                    borderColor={hasError ? 'redfigma-47' : 'greyfigma-90'}
                    disabled={!hydrated || pending}
                    defaultValue={field.state.value}
                    onChange={(e) => field.handleChange(e.currentTarget.value)}
                    enablePasswordManagers
                  />
                  <Button
                    type="submit"
                    size="large"
                    mode="icon"
                    aria-label={t('auth:sign_in.discovery.continue')}
                    disabled={!hydrated || pending || field.state.value.trim() === ''}
                  >
                    {pending ? <Spinner className="size-5" /> : <Icon icon="arrow-forward" className="size-5" />}
                  </Button>
                </div>
                <FormErrorOrDescription errors={getFieldErrors(field.state.meta.errors)} />
              </>
            );
          }}
        </form.Field>
        {discoveryError ? (
          <p role="alert" className="text-s text-red-primary">
            {t(discoveryErrorLabels[discoveryError])}
          </p>
        ) : null}
      </form>
    </div>
  );
}
