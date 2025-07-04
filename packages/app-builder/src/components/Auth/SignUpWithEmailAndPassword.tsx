import {
  EmailExistsError,
  NetworkRequestFailed,
  TooManyRequest,
  useEmailAndPasswordSignUp,
  WeakPasswordError,
} from '@app-builder/services/auth/auth.client';
import { useClientServices } from '@app-builder/services/init.client';
import { getFieldErrors, handleSubmit } from '@app-builder/utils/form';
import { getRoute } from '@app-builder/utils/routes';
import { Link } from '@remix-run/react';
import * as Sentry from '@sentry/remix';
import { useForm } from '@tanstack/react-form';
import toast from 'react-hot-toast';
import { Trans, useTranslation } from 'react-i18next';
import { Button } from 'ui-design-system';
import * as z from 'zod';
import { FormErrorOrDescription } from '../Form/Tanstack/FormErrorOrDescription';
import { FormInput } from '../Form/Tanstack/FormInput';
import { FormLabel } from '../Form/Tanstack/FormLabel';

const emailSchema = z.string().email();
const passwordSchema = z.string().min(1, 'Required');
const confirmPasswordSchema = z.string().min(1, 'Required');

const emailAndPasswordFormSchema = z.object({
  credentials: z
    .object({
      email: emailSchema,
      password: passwordSchema,
      confirmPassword: confirmPasswordSchema,
    })
    .refine((data) => data.confirmPassword === data.password, {
      message: 'Passwords do not match',
      path: ['confirmPassword'],
    }),
});

type EmailAndPasswordForm = z.infer<typeof emailAndPasswordFormSchema>;

export function SignUpWithEmailAndPassword({ signUp }: { signUp: () => void }) {
  const { t } = useTranslation(['auth', 'common']);
  const clientServices = useClientServices();

  const emailAndPasswordSignUp = useEmailAndPasswordSignUp(
    clientServices.authenticationClientService,
  );

  const form = useForm({
    defaultValues: { credentials: { email: '', password: '' } } as EmailAndPasswordForm,
    validators: { onSubmit: emailAndPasswordFormSchema },
    onSubmit: async ({ value: { credentials }, formApi }) => {
      try {
        await emailAndPasswordSignUp(credentials.email, credentials.password);
        signUp();
      } catch (error) {
        if (error instanceof EmailExistsError) {
          formApi.setFieldMeta('credentials.email', (prev) => ({
            ...prev,
            errors: [t('auth:sign_up.errors.email_already_exists')],
          }));
        } else if (error instanceof WeakPasswordError) {
          formApi.setFieldMeta('credentials.email', (prev) => ({
            ...prev,
            errors: [t('auth:sign_up.errors.weak_password_error')],
          }));
        } else if (error instanceof NetworkRequestFailed) {
          toast.error(t('common:errors.firebase_network_error'));
        } else if (error instanceof TooManyRequest) {
          toast.error(t('common:errors.too_many_requests'));
        } else {
          Sentry.captureException(error);
          toast.error(t('common:errors.unknown'));
        }
      }
    },
  });

  return (
    <form className="contents" onSubmit={handleSubmit(form)}>
      <div className="flex w-full flex-col gap-4">
        <form.Field
          name="credentials.email"
          validators={{
            onChange: emailSchema,
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
            onChange: passwordSchema,
          }}
        >
          {(field) => (
            <div className="flex flex-col items-start gap-2">
              <FormLabel name={field.name} valid={field.state.meta.errors.length === 0}>
                {t('auth:sign_in.password')}
              </FormLabel>
              <FormInput
                className="w-full"
                type="password"
                name={field.name}
                autoComplete="new-password"
                valid={field.state.meta.errors.length === 0}
                defaultValue={field.state.value}
                onChange={(e) => field.handleChange(e.currentTarget.value)}
              />
              <FormErrorOrDescription errors={getFieldErrors(field.state.meta.errors)} />
            </div>
          )}
        </form.Field>
        <form.Field
          name="credentials.confirmPassword"
          validators={{
            onChange: confirmPasswordSchema,
          }}
        >
          {(field) => (
            <div className="flex flex-col items-start gap-2">
              <FormLabel name={field.name} valid={field.state.meta.errors.length === 0}>
                {t('auth:sign_up.confirm_password')}
              </FormLabel>
              <FormInput
                className="w-full"
                type="password"
                name={field.name}
                autoComplete="new-password"
                valid={field.state.meta.errors.length === 0}
                defaultValue={field.state.value}
                onChange={(e) => field.handleChange(e.currentTarget.value)}
              />
              <FormErrorOrDescription errors={getFieldErrors(field.state.meta.errors)} />
            </div>
          )}
        </form.Field>
      </div>
      <div className="flex flex-col gap-4">
        <Button type="submit">{t('auth:sign_up')}</Button>
        <p className="text-s">
          <Trans
            t={t}
            i18nKey="auth:sign_up.already_have_an_account_sign_up"
            components={{
              SignIn: <Link className="text-purple-65 underline" to={getRoute('/sign-in')} />,
            }}
            values={{
              signIn: t('auth:sign_in'),
            }}
          />
        </p>
      </div>
    </form>
  );
}

export const StaticSignUpWithEmailAndPassword = () => {
  const { t } = useTranslation(['auth', 'common']);

  return (
    <form className="contents">
      <div className="flex w-full flex-col gap-4">
        <div className="flex flex-col items-start gap-2">
          <FormLabel name="credentials.email">{t('auth:sign_in.email')}</FormLabel>
          <FormInput name="credentials.email" valid className="w-full" type="email" />
        </div>
        <div className="flex flex-col items-start gap-2">
          <FormLabel name="credentials.password">{t('auth:sign_in.password')}</FormLabel>
          <FormInput
            name="credentials.password"
            className="w-full"
            type="password"
            autoComplete="current-password"
            valid
          />
        </div>
        <div className="flex flex-col items-start gap-2">
          <FormLabel name="credentials.confirmPassword">
            {t('auth:sign_up.confirm_password')}
          </FormLabel>
          <FormInput
            name="credentials.confirmPassword"
            className="w-full"
            type="password"
            autoComplete="current-password"
            valid
          />
        </div>
      </div>
      <Button>{t('auth:sign_in')}</Button>
    </form>
  );
};
