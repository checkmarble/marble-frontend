import {
  EmailUnverified,
  InvalidLoginCredentials,
  NetworkRequestFailed,
  useEmailAndPasswordSignIn,
  WrongPasswordError,
} from '@app-builder/services/auth/auth.client';
import { type AuthPayload } from '@app-builder/services/auth/auth.server';
import { useClientServices } from '@app-builder/services/init.client';
import { getFieldErrors } from '@app-builder/utils/form';
import { getRoute } from '@app-builder/utils/routes';
import { sleep } from '@app-builder/utils/sleep';
import { Link, useNavigate } from '@remix-run/react';
import * as Sentry from '@sentry/remix';
import { useForm } from '@tanstack/react-form';
import toast from 'react-hot-toast';
import { useTranslation } from 'react-i18next';
import { useHydrated } from 'remix-utils/use-hydrated';
import { Button } from 'ui-design-system';
import * as z from 'zod';

import { FormErrorOrDescription } from '../Form/Tanstack/FormErrorOrDescription';
import { FormInput } from '../Form/Tanstack/FormInput';
import { FormLabel } from '../Form/Tanstack/FormLabel';
import { Spinner } from '../Spinner';

const emailAndPasswordFormSchema = z.object({
  credentials: z.object({
    email: z.string().email(),
    password: z.string().min(1, 'Required'),
  }),
});

type EmailAndPasswordForm = z.infer<typeof emailAndPasswordFormSchema>;

export function SignInWithEmailAndPassword({
  signIn,
  loading,
  additionalContent,
  prefilledEmail,
}: {
  signIn: (authPayload: AuthPayload) => void;
  loading?: boolean;
  additionalContent?: React.ReactNode;
  prefilledEmail?: string | null;
}) {
  const { t } = useTranslation(['auth', 'common']);
  const clientServices = useClientServices();
  const navigate = useNavigate();
  const hydrated = useHydrated();

  const emailAndPasswordSignIn = useEmailAndPasswordSignIn(
    clientServices.authenticationClientService,
  );

  const form = useForm({
    defaultValues: {
      credentials: { email: prefilledEmail ?? '', password: '' },
    } as EmailAndPasswordForm,
    validators: { onSubmit: emailAndPasswordFormSchema },
    onSubmit: async ({ value: { credentials }, formApi }) => {
      try {
        const result = await emailAndPasswordSignIn(credentials.email, credentials.password);
        if (!result) return;
        const { idToken, csrf } = result;
        if (!idToken) return;
        signIn({ type: 'email', idToken, csrf });
        // Hack to wait for the form to be submitted, otherwise the loading spinner will be flickering
        await sleep(1000);
      } catch (error) {
        if (error instanceof EmailUnverified) {
          navigate(getRoute('/email-verification'));
        } else if (
          error instanceof WrongPasswordError ||
          error instanceof InvalidLoginCredentials
        ) {
          formApi
            .getFieldMeta('credentials.password')
            ?.errors.push({ message: t('auth:sign_in.errors.invalid_login_credentials') });
        } else if (error instanceof NetworkRequestFailed) {
          toast.error(t('common:errors.firebase_network_error'));
        } else {
          Sentry.captureException(error);
          toast.error(t('common:errors.unknown'));
        }
      }
    },
  });

  return (
    <form
      className="contents"
      onSubmit={(e) => {
        e.preventDefault();
        e.stopPropagation();
        form.handleSubmit();
      }}
    >
      <div className="flex w-full flex-col gap-4">
        <form.Field
          name="credentials.email"
          validators={{
            onChange: emailAndPasswordFormSchema.shape.credentials.shape.email,
          }}
        >
          {(field) => (
            <div className="flex flex-col items-start gap-2">
              <FormLabel name={field.name} valid={field.state.meta.errors.length === 0}>
                {t('auth:sign_in.email')}
              </FormLabel>
              <FormInput
                type="email"
                name={field.name}
                disabled={!hydrated}
                className="w-full"
                valid={field.state.meta.errors.length === 0}
                defaultValue={field.state.value}
                onChange={(e) => field.handleChange(e.currentTarget.value)}
              />
              <FormErrorOrDescription errors={getFieldErrors(field.state.meta.errors)} />
            </div>
          )}
        </form.Field>
        <form.Field
          name="credentials.password"
          validators={{
            onChange: emailAndPasswordFormSchema.shape.credentials.shape.password,
          }}
        >
          {(field) => (
            <div className="flex flex-col items-start gap-2">
              <FormLabel name={field.name} valid={field.state.meta.errors.length === 0}>
                {t('auth:sign_in.password')}
              </FormLabel>
              <FormInput
                className="w-full"
                name={field.name}
                type="password"
                autoComplete="current-password"
                disabled={!hydrated}
                valid={field.state.meta.errors.length === 0}
                defaultValue={field.state.value}
                onChange={(e) => field.handleChange(e.currentTarget.value)}
              />
              <FormErrorOrDescription errors={getFieldErrors(field.state.meta.errors)} />
            </div>
          )}
        </form.Field>
        <Link className="text-s text-purple-65 underline" to={getRoute('/create-password')}>
          {t('auth:sign_in.forgot_password')}
        </Link>
      </div>
      <div className="flex flex-col gap-2">
        <Button type="submit" disabled={!hydrated}>
          {loading || form.state.isSubmitting ? <Spinner className="size-4" /> : t('auth:sign_in')}
        </Button>
        {additionalContent}
      </div>
    </form>
  );
}

export const StaticSignInWithEmailAndPassword = ({
  additionalContent,
  prefilledEmail,
}: {
  additionalContent?: React.ReactNode;
  prefilledEmail?: string | null;
}) => {
  const hydrated = useHydrated();
  const { t } = useTranslation(['auth', 'common']);

  return (
    <form className="contents">
      <div className="flex w-full flex-col gap-4">
        <div className="flex flex-col items-start gap-2">
          <FormLabel name="credentials.email">{t('auth:sign_in.email')}</FormLabel>
          <FormInput
            type="email"
            name="credentials.email"
            disabled={!hydrated}
            className="w-full"
            valid
            defaultValue={prefilledEmail ?? ''}
          />
        </div>
        <div className="flex flex-col items-start gap-2">
          <FormLabel name="credentials.password">{t('auth:sign_in.password')}</FormLabel>
          <FormInput
            type="password"
            name="credentials.password"
            autoComplete="current-password"
            disabled={!hydrated}
            className="w-full"
            valid
          />
        </div>
        <Link className="text-s text-purple-65 underline" to={getRoute('/create-password')}>
          {t('auth:sign_in.forgot_password')}
        </Link>
      </div>
      <div className="flex flex-col gap-2">
        <Button type="submit" disabled={!hydrated}>
          {t('auth:sign_in')}
        </Button>
        {additionalContent}
      </div>
    </form>
  );
};
