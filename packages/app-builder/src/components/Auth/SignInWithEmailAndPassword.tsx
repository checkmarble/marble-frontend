import {
  EmailUnverified,
  NetworkRequestFailed,
  useEmailAndPasswordSignIn,
  UserNotFoundError,
  WrongPasswordError,
} from '@app-builder/services/auth/auth.client';
import { type AuthPayload } from '@app-builder/services/auth/auth.server';
import { clientServices } from '@app-builder/services/init.client';
import { getFieldErrors } from '@app-builder/utils/form';
import { getRoute } from '@app-builder/utils/routes';
import { sleep } from '@app-builder/utils/sleep';
import { useNavigate } from '@remix-run/react';
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
}: {
  signIn: (authPayload: AuthPayload) => void;
  loading?: boolean;
}) {
  const { t } = useTranslation(['auth', 'common']);
  const navigate = useNavigate();
  const hydrated = useHydrated();

  const emailAndPasswordSignIn = useEmailAndPasswordSignIn(
    clientServices.authenticationClientService,
  );

  const form = useForm({
    defaultValues: { credentials: { email: '', password: '' } } as EmailAndPasswordForm,
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
        } else if (error instanceof UserNotFoundError || error instanceof WrongPasswordError) {
          formApi.setFieldMeta('credentials.password', (prev) => ({
            ...prev,
            errors: [t('auth:sign_in.errors.wrong_password_error')],
          }));
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
      className="flex w-full flex-col gap-4"
      onSubmit={(e) => {
        e.preventDefault();
        e.stopPropagation();
        form.handleSubmit();
      }}
    >
      <form.Field name="credentials.email">
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
              onBlur={field.handleBlur}
            />
            <FormErrorOrDescription errors={getFieldErrors(field.state.meta.errors)} />
          </div>
        )}
      </form.Field>
      <form.Field name="credentials.password">
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
              onBlur={field.handleBlur}
            />
            <FormErrorOrDescription errors={getFieldErrors(field.state.meta.errors)} />
          </div>
        )}
      </form.Field>
      <Button type="submit" disabled={!hydrated}>
        {loading || form.state.isSubmitting ? <Spinner className="size-4" /> : t('auth:sign_in')}
      </Button>
    </form>
  );
}

export const StaticSignInWithEmailAndPassword = () => {
  const hydrated = useHydrated();
  const { t } = useTranslation(['auth', 'common']);

  return (
    <form className="flex w-full flex-col gap-4">
      <div className="flex flex-col items-start gap-2">
        <FormLabel name="credentials.email">{t('auth:sign_in.email')}</FormLabel>
        <FormInput
          type="email"
          name="credentials.email"
          disabled={!hydrated}
          className="w-full"
          valid
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
      <Button type="submit" disabled={!hydrated}>
        {t('auth:sign_in')}
      </Button>
    </form>
  );
};
