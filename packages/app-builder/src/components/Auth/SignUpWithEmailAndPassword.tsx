import {
  EmailExistsError,
  NetworkRequestFailed,
  TooManyRequest,
  useEmailAndPasswordSignUp,
  WeakPasswordError,
} from '@app-builder/services/auth/auth.client';
import { useClientServices } from '@app-builder/services/init.client';
import { getFieldErrors, handleSubmit } from '@app-builder/utils/form';
import * as Sentry from '@sentry/remix';
import { useForm } from '@tanstack/react-form';
import toast from 'react-hot-toast';
import { useTranslation } from 'react-i18next';
import { Button } from 'ui-design-system';
import * as z from 'zod';

import { FormErrorOrDescription } from '../Form/Tanstack/FormErrorOrDescription';
import { FormInput } from '../Form/Tanstack/FormInput';
import { FormLabel } from '../Form/Tanstack/FormLabel';

const emailAndPasswordFormSchema = z.object({
  credentials: z.object({
    email: z.string().email(),
    password: z.string().min(1, 'Required'),
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
    <form className="flex w-full flex-col gap-4" onSubmit={handleSubmit(form)}>
      <form.Field
        name="credentials.email"
        validators={{
          onBlur: emailAndPasswordFormSchema.shape.credentials.shape.email,
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
      <form.Field
        name="credentials.password"
        validators={{
          onBlur: emailAndPasswordFormSchema.shape.credentials.shape.password,
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
              type="password"
              name={field.name}
              autoComplete="new-password"
              valid={field.state.meta.errors.length === 0}
              defaultValue={field.state.value}
              onChange={(e) => field.handleChange(e.currentTarget.value)}
              onBlur={field.handleBlur}
            />
            <FormErrorOrDescription errors={getFieldErrors(field.state.meta.errors)} />
          </div>
        )}
      </form.Field>
      <Button type="submit">{t('auth:sign_up')}</Button>
    </form>
  );
}

export const StaticSignUpWithEmailAndPassword = () => {
  const { t } = useTranslation(['auth', 'common']);

  return (
    <form className="flex w-full flex-col gap-4">
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
      <Button>{t('auth:sign_in')}</Button>
    </form>
  );
};
