import {
  NetworkRequestFailed,
  TooManyRequest,
  useSendPasswordResetEmail,
} from '@app-builder/services/auth/auth.client';
import { useClientServices } from '@app-builder/services/init.client';
import { TranslationObject } from '@app-builder/types/i18n';
import { getFieldErrors } from '@app-builder/utils/form';
import * as Sentry from '@sentry/remix';
import { useForm } from '@tanstack/react-form';
import toast from 'react-hot-toast';
import { Button } from 'ui-design-system';
import * as z from 'zod';
import { FormErrorOrDescription } from '../Form/Tanstack/FormErrorOrDescription';
import { FormInput } from '../Form/Tanstack/FormInput';
import { FormLabel } from '../Form/Tanstack/FormLabel';

const resetPasswordFormSchema = z.object({
  email: z.string().email(),
});

type ResetPasswordForm = z.infer<typeof resetPasswordFormSchema>;

export function ResetPassword({
  translationObject,
}: {
  translationObject: TranslationObject<['auth', 'common']>;
}) {
  const { tAuth, tCommon } = translationObject;
  const clientServices = useClientServices();

  const sendPasswordResetEmail = useSendPasswordResetEmail(
    clientServices.authenticationClientService,
  );

  const form = useForm({
    defaultValues: { email: '' } as ResetPasswordForm,
    validators: { onSubmit: resetPasswordFormSchema },
    onSubmit: async ({ value: { email } }) => {
      try {
        await sendPasswordResetEmail(email);
        toast.success(tAuth('reset-password.email_sent'));
      } catch (error) {
        if (error instanceof NetworkRequestFailed) {
          toast.error(tCommon('errors.firebase_network_error'));
        } else if (error instanceof TooManyRequest) {
          toast.error(tCommon('errors.too_many_requests'));
        } else {
          Sentry.captureException(error);
          toast.error(tCommon('errors.unknown'));
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
      <form.Field
        name="email"
        validators={{
          onBlur: resetPasswordFormSchema.shape.email,
          onChange: resetPasswordFormSchema.shape.email,
        }}
      >
        {(field) => (
          <div className="flex flex-col items-start gap-2">
            <FormLabel name={field.name} valid={field.state.meta.errors.length === 0}>
              {tAuth('sign_in.email')}
            </FormLabel>
            <FormInput
              type="email"
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
      <Button type="submit">{tAuth('reset-password.send')}</Button>
    </form>
  );
}

export const StaticResetPassword = ({
  translationObject,
}: {
  translationObject: TranslationObject<['auth']>;
}) => {
  const { tAuth } = translationObject;

  return (
    <form className="flex w-full flex-col gap-4">
      <div className="flex flex-col items-start gap-2">
        <FormLabel name="email">{tAuth('sign_in.email')}</FormLabel>
        <FormInput type="email" className="w-full" />
      </div>
      <Button>{tAuth('reset-password.send')}</Button>
    </form>
  );
};
